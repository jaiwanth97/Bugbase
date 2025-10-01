const express = require('express')
const router = express.Router()
const {Bug, validateBug} = require('../models/bug')
const AuthenticateUser = require('../middleware/auth')
const { default: mongoose } = require('mongoose')

router.post('/', AuthenticateUser, async(req,res)=>{
    if(req.user.role !== 'user') {
        return res.status(403).send('Only users can create bugs')
    }

    const {error} = validateBug(req.body)
    if(error) {
        return res.status(400).send({message: error.details[0].message})
    }

    const bug = new Bug({
        title: req.body.title,
        description: req.body.description,
        status: req.body.status || 'open',
        priority: req.body.priority || 'low',
        reporter: req.user._id,  // Set reporter from authenticated user
        isApproved: false
    })

    try {
        await bug.save()
        res.status(201).send({message: 'Bug is reported successfully', bug})
    } catch(err) {
        console.error('Error creating bug:', err)
        res.status(500).send({message: 'Server error while creating bug'})
    }
})

router.get('/', AuthenticateUser, async(req,res)=>{
    try {
        let query = {};
        
        if(req.user.role === 'dev') {
            query = { 
                assignedTo: req.user._id,
                status: { $in: ['inprogress', 'qa'] }
            };
        } else if(req.user.role === 'user') {
            query = { reporter: req.user._id };
        } else if(req.user.role !== 'admin') {
            query = { 
                isApproved: true,
                status: { $in: ['inprogress', 'qa', 'closed'] }
            };
        }

        const bugs = await Bug.find(query)
            .populate('reporter', 'username email')
            .populate('assignedTo', 'username email role')
            .sort('-createdAt');
            
        res.send(bugs);
    } catch(error) {
        console.error('Error fetching bugs:', error);
        res.status(500).send({message: 'Server error while fetching bugs'});
    }
})
 
router.get('/dev/assigned', AuthenticateUser, async(req, res) => {
    if(req.user.role !== 'dev') {
        return res.status(403).send({ message: 'Access denied' });
    }

    try {
        const bugs = await Bug.find({
            assignedTo: req.user._id,
            status: 'inprogress' // Only show in-progress bugs
        })
        .populate('reporter', 'username email')
        .populate('assignedTo', 'username email role')
        .sort('-updatedAt');

        res.send(bugs);
    } catch(error) {
        console.error('Error fetching assigned bugs:', error);
        res.status(500).send({ message: 'Server error while fetching bugs' });
    }
});

// Alias to match frontend expectation
router.get('/assigned', AuthenticateUser, async(req, res) => {
    if(req.user.role !== 'dev') {
        return res.status(403).send({ message: 'Access denied' });
    }

    try {
        const bugs = await Bug.find({
            assignedTo: req.user._id,
            status: { $in: ['open', 'inprogress', 'qa'] }
        })
        .populate('reporter', 'username email')
        .populate('assignedTo', 'username email role')
        .sort('-updatedAt');

        res.send(bugs);
    } catch(error) {
        console.error('Error fetching assigned bugs:', error);
        res.status(500).send({ message: 'Server error while fetching bugs' });
    }
});

router.get('/:id', AuthenticateUser, async(req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({message: 'Invalid bug ID'})
    }

    const bug = await Bug.findById(req.params.id).populate('reporter', 'username email')
    if(!bug) {
        return res.status(404).send({message: 'Bug not found'})
    }
    const showStatus = req.user.role === 'admin' || bug.reporter._id.equals(req.user._id);
    const canView =
        req.user.role === 'admin' ||
        bug.reporter._id.equals(req.user._id) ||
        bug.isApproved;

    if (!canView) {
        return res.status(403).send({ message: 'Access denied' });
    }

    res.send({
        _id: bug._id,
        title: bug.title,
        description: bug.description,
        priority: bug.priority,
        reporter: bug.reporter,
        ...(showStatus ? { status: bug.status } : {})})
})

router.put('/:id/status', AuthenticateUser, async(req,res)=>{
    const {status} = req.body

    if(!['open', 'inprogress', 'qa', 'closed'].includes(status)) {
        return res.status(400).send({message: 'Invalid status'})
    }

    const bug = await Bug.findById(req.params.id)
    if(!bug) {
        return res.status(404).send({message: 'No bug with the given ID'})
    }

    if((req.user.role === 'dev' || req.user.role === 'qa') && !bug.isApproved) {
        return res.status(403).send({message: 'Bug not approved by admin'})
    }

    if(req.user.role !== 'admin' && req.user.role !== 'dev' && req.user.role !== 'qa') {
        return res.status(403).send({message: 'Access denied'})
    }

    bug.status = status
    await bug.save()
    res.status(200).send({message: 'Bug status saved'})
})

// QA queue for reviewers
router.get('/qa/list', AuthenticateUser, async(req, res) => {
    if(req.user.role !== 'qa' && req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Access denied' });
    }

    try {
        const bugs = await Bug.find({ status: 'qa' })
            .populate('reporter', 'username email')
            .populate('assignedTo', 'username email role')
            .sort('-updatedAt');
        res.send(bugs);
    } catch(error) {
        console.error('Error fetching QA bugs:', error);
        res.status(500).send({ message: 'Server error while fetching QA bugs' });
    }
});

router.put('/:id/approve', AuthenticateUser, async(req,res)=>{
    if(req.user.role !== 'admin') {
        return res.status(403).send({message: 'Only admins can approve bugs'})
    }

    const bug = await Bug.findById(req.params.id)
    if(!bug) {
        res.status(403).send({message: 'No bug with given ID found'})
    }

    bug.isApproved = true
    await bug.save()
    res.send({message: 'Bug status saved'})
})

router.delete('/:id', AuthenticateUser, async(req,res)=>{
    if(req.user.role !== 'admin') {
        return res.status(403).send({message: 'Only admins can delete a bug'})
    }

    const bug = await Bug.findByIdAndDelete(req.params.id)
    if(!bug) {
        return res.status(403).send({message: 'No bug with the given ID found'})
    }

    res.send({message: 'Bug not found'})
})

router.put('/:id/assign', AuthenticateUser, async(req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Only admins can assign bugs' });
    }

    const { developerId } = req.body;
    if (!developerId) {
        return res.status(400).send({ message: 'Developer ID is required' });
    }

    try {
        const updatedBug = await Bug.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    assignedTo: developerId,
                    status: 'inprogress',
                    isApproved: true
                }
            },
            { new: true }
        )
        .populate('reporter', 'username email')
        .populate('assignedTo', 'username email role');

        if (!updatedBug) {
            return res.status(404).send({ message: 'Bug not found' });
        }

        res.send(updatedBug);
    } catch (error) {
        console.error('Error assigning bug:', error);
        res.status(500).send({ message: 'Server error while assigning bug' });
    }
});

module.exports = router