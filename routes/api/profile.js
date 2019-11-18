const express = require('express');
const config = require('config');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
// const User = require('../../models/User');

const router = express.Router();

// @route   GET api/profile/me
// @desc    Get curent user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user',
      ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for the user' });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

module.exports = router;
