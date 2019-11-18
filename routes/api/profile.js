const express = require('express');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const { Profile, profileFieldNamesNonReq, profileFieldSocial } = require('../../models/Profile');
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

// @route   POST api/profile/
// @desc    Create/update curent user's profile
// @access  Private
router.post('/', [auth, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'Skill is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const profileFields = {};
  profileFields.user = req.user.id;
  profileFieldNamesNonReq.forEach((field) => {
    if (req.body[field]) {
      profileFields[field] = req.body[field];
    }
  });

  const { status, skills } = req.body;
  if (status) profileFields.status = status;
  if (skills) {
    profileFields.skills = skills.split(',').map((skill) => skill.trim());
  }

  profileFields.social = {};
  profileFieldSocial.forEach((field) => {
    if (req.body[field]) {
      profileFields.social[field] = req.body[field];
    }
  });

  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true },
      );
    } else {
      profile = new Profile(profileFields);
      await profile.save();
    }
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});


module.exports = router;
