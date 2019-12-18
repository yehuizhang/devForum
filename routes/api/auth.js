const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

const router = express.Router();

// @route   GET api/auth
// @desc    The user based on the token
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res
        .status(400)
        .json({ msg: 'Invalid token. User does not exist.' });
    }
    return res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(422)
          .json({ errors: [{ msg: 'Invalid username or password' }] });
      }

      // match password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(422)
          .json({ errors: [{ msg: 'Invalid username or password' }] });
      }

      // return json-webtoken
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: config.get('tokenExpireTime') },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
