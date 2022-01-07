const mongoose = require('mongoose');

const adSchema = mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true,
    index: true
  },
},
{
  timestamps: true
})

module.exports.Ad = mongoose.model('Ad', adSchema)