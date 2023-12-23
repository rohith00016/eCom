const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const middleware = require('../middleware/index');
const nodemailer = require('nodemailer');

// User Registration with Validation
// User Registration with Validation
router.post(
  '/register',
  [
    // Validate and sanitize user input
    body('username').isLength({ min: 4 }).trim().escape().isAlphanumeric(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if the user already exists
      console.log('Checking if user exists...');
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        console.log('User already exists:', existingUser);
        return res.status(400).json({ error: 'Username or email already in use' });
      }

      // Hash the password
      console.log('Hashing the password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate a verification code
      console.log('Generating verification code...');
      const verificationCode = generateVerificationCode();

      // Create a new user
      console.log('Creating a new user...');
      const user = new User({ username, email, password: hashedPassword, verificationCode });
      await user.save();

      // Send verification email
      console.log('Sending verification email...');
      await sendVerificationEmail(email, verificationCode);

      console.log('User registered successfully:', user);
      res.json({ message: 'Registration successful. Verification email sent.' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Failed to register the user.' });
    }
  }
);


const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'rohitpandya228@gmail.com',
        pass: 'ejjdqsgvlckntdrd',
      },
    });

    const verificationLink = `http://localhost:3000/users/verify/${verificationCode}`;

    const mailOptions = {
      from: 'rohitpandya228@gmail.com',
      to: email,
      subject: 'Account Verification',
      html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);

  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};


// Helper function to generate a random verification code
const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

router.get('/verify/:verificationCode', async (req, res) => {
  try {
    const verificationCode = req.params.verificationCode;

    // Find the user with the given verification code
    const user = await User.findOne({ verificationCode });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided verification code.' });
    }

    // Update the 'verify' field to true
    user.verify = true;

    // Save the updated user
    await user.save();

    res.json({ message: 'Email verification successful. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify email.' });
  }
});


// User Login with Validation
router.post(
  '/login',middleware.ensureNotLoggedIn,[
    // Validate and sanitize user input
    body('username').trim().escape().isAlphanumeric(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Failed to log in.' });
    }
  }
);

const updateProfileValidation = [
  body('username').optional({ nullable: true }).not().isEmpty().withMessage('Username is required'),
  body('firstName').optional({ nullable: true }).not().isEmpty().withMessage('First name is required'),
  body('lastName').optional({ nullable: true }).not().isEmpty().withMessage('Last name is required'),
  body('address.street').optional({ nullable: true }).not().isEmpty().withMessage('Street address is required'),
  body('address.city').optional({ nullable: true }).not().isEmpty().withMessage('City is required'),
  body('address.state').optional({ nullable: true }).not().isEmpty().withMessage('State is required'),
  body('address.postalCode').optional({ nullable: true }).not().isEmpty().withMessage('Postal code is required'),
  body('address.country').optional({ nullable: true }).not().isEmpty().withMessage('Country is required'),
  body('phone').optional({ nullable: true }).isMobilePhone().withMessage('Invalid phone number'),
];

// Update user profile route
router.put('/profile', middleware.ensureLoggedIn, updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;

    // Update only the provided fields
    const updateFields = {};
    const { username, firstName, lastName, address, phone } = req.body;

    if (username) updateFields.username = username;
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (address) updateFields.address = address;
    if (phone) updateFields.phone = phone;

    // Update user profile
    await User.findByIdAndUpdate(userId, updateFields);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

module.exports = router;
