import mongoose from 'mongoose';
const { Schema } = mongoose;

// Create a schema for the user
const userSchema = new mongoose.Schema({
  // email is a string and is required
  email: {
    type: String,
    required: true,
    unique: true
  },
  // password is a string and is required
  password: {
    type: String,
    required: true
  },
  // name is a string and is required
  name: {
    type: String,
    required: true
  }
});



// Create a model for the user
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;