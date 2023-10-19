const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../api/models/User');
router.post('/signup', async (req, res) => {

    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, reason: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, reason: 'Passwords do not match' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ success: false, reason: 'User with this email already exists' });
        }
    
        // Hash the password before saving it
        const saltRounds = 10; // Adjust the number of salt rounds as needed
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        // Create a new user with the hashed password
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
    
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, reason: 'Error registering user' });
    }
})

// Change Password route
router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
  
    // Validate input
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, reason: 'Missing required fields' });
    }
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
  
      // Check if the user exists
      if (!user) {
        return res.status(400).json({ success: false, reason: 'User not found' });
      }
  
      // Compare the provided old password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  
      if (passwordMatch) {
        // Passwords match, update to the new password
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = newHashedPassword;
        await user.save();
  
        res.status(200).json({ success: true, message: 'Password changed successfully' });
      } else {
        // Passwords do not match
        res.status(401).json({ success: false, reason: 'Incorrect old password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, reason: 'Error changing password' });
    }
});

  
// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, reason: 'Missing required fields' });
    }
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
  
      // Check if the user exists
      if (!user) {
        return res.status(400).json({ success: false, reason: 'User not found' });
      }
  
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (passwordMatch) {
        // Passwords match, user is authenticated
        res.status(200).json({ success: true, message: 'Login successful' });
      } else {
        // Passwords do not match
        res.status(401).json({ success: false, reason: 'Incorrect password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, reason: 'Error logging in' });
    }
});
  


module.exports = router;