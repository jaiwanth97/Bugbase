const jsonwebtoken = require('jsonwebtoken')

function AuthenticateUsers(req,res,next) {
    const authHeader = req.headers['authorization']
    if(!authHeader) {
        return res.status(401).send({message: 'Access denied, No token is provided'})
    }

    const token = authHeader.split(" ")[1]
    if(!token) {
        return res.status(401).send({message: 'Invalid token is provided'})
    }

    try{
        const decoded = jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        next()
    } catch(err) {
        res.status(401).send({message: 'Invalid token'})
    }
}

module.exports = AuthenticateUsers