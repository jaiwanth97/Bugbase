const mongoose = require('mongoose')
const Joi = require('joi')

const bugSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['open', 'inprogress', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isApproved: {
        type: String,
        default: false
    }
}, {timestamps: true})

