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

const validateBug = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().allow('', null),
    status: Joi.string().valid('open', 'inprogress', 'closed'),
    priority: Joi.string().valid('low', 'medium', 'high')
    // removed reporter from validation as it's set from auth token
  });
  return schema.validate(data);
};
const Bug = mongoose.model('Bug', bugSchema)
module.exports = {
    Bug,
    validateBug
}