const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: String,
    color: String,
    image: String
})

exports.Category = mongoose.model('Category', categorySchema)