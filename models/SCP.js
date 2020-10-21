const mongoose = require('mongoose');

const SCPSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('SCP', SCPSchema);