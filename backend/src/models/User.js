const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  activeServiceAreaId: {
    type: Number,
    default: null,
  },
  profilePhoto: {
    type: String, // this will be the URL or base64 string
    default: "",
  },
  title: {
    type: String, // e.g., "Manager", "Owner", etc.
    default: "",
  },
});

module.exports = mongoose.model('User', UserSchema);