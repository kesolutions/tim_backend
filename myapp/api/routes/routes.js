const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const User = require('../api/models/User');

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['key'], // revoked api key
});




// Validation middleware for signup route
const signupValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

// Validation middleware for change password route
const changePasswordValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Validation middleware for the new company
const companyInputValidation = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('coreValues').notEmpty().isArray().withMessage('Core values must be a non-empty array'),
  body('industry').notEmpty().withMessage('Industry is required'),
];

th
// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, reason: errors.array()[0].msg });
  }
  next();
};

// Signup route with validation
router.post('/signup', signupValidation, handleValidationErrors, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, reason: 'User with this email already exists' });
    }

    // Hash the password before saving it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, reason: 'Error registering user' });
  }
});

// Change Password route with validation
router.post('/change-password', changePasswordValidation, handleValidationErrors, async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

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

// Login route with validation
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
], handleValidationErrors, async (req, res) => {
  const { email, password } = req.body;

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

router.post('/company', companyInputValidation, handleValidationErrors, (req, res) => {
  const { name, coreValues, industry } = req.body;

  try {
    // Your logic to store or process the company information
    // For now, we'll just send a response with the combined prompt
    const prompt = `Company: ${name}\nCore Values: ${coreValues.join(', ')}\nIndustry: ${industry}`;
    res.status(200).json({ success: true, message: prompt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, reason: 'Error processing company information' });
  }
});

module.exports = router;
