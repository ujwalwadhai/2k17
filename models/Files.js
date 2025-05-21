const mongoose = require('mongoose');
const { createDate } = require('../utils/dateFunctions');

const FilesSchema = mongoose.Schema({
    pid: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Files', FilesSchema);