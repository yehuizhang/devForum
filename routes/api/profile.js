const express = require('express');
const config = require('config');
const axios = require('axios');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const { Profile, profileFieldNamesNonReq, profileFieldSocial } = require('../../models/Profile');
const User = require('../../models/User');
const getRepoInfo = require('./helper/getGithubRepoInfo');

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

// @route   GET api/profile/
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    return res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'No profile found for the user' });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No profile found for the user' });
    }
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

// @route   DELETE api/profile/
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // TODO: remove user's posts.

    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }

  const {
    title, company, location, from, to, current, description,
  } = req.body;

  const newExp = {
    title, company, location, from, to, current, description,
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter((item) => item.id !== req.params.exp_id);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/education', [auth, [
  check('school', 'School name is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('fieldOfStudy', 'Field of study is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }

  const {
    school, degree, fieldOfStudy, location, from, to, current, description,
  } = req.body;

  const newEdu = {
    school, degree, fieldOfStudy, location, from, to, current, description,
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter((item) => item.id !== req.params.edu_id);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      url: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
      type=all&sort=created&direction=asc&client_id=${config.get('githubClientID')}&
      client_secret=${config.get('githubClientSecret')}`,
      method: 'get',
      headers: { 'user-agent': 'node.js' },
    };
    const githubResponse = await axios(options);
    const repoData = githubResponse.data;
    res.json(repoData.map((repo) => ({
      name: repo.name,
      createdAt: repo.created_at,
      id: repo.node_id,
      url: repo.html_url,
    })));
  } catch (error) {
    if (error.response.status === 404) {
      return res.status(404).json({ msg: 'Invalid github username' });
    }
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

// @route   GET api/profile/github-graphql/:username
// @desc    Get user repos from Github through graphQL API
// @access  Public
router.get('/github-graphql/:username', async (req, res) => {
  try {
    const repoData = await getRepoInfo(req.params.username, null);
    res.json(repoData);
  } catch (error) {
    if (error.response.errors && error.response.errors[0].type === 'NOT_FOUND') {
      return res.status(404).json({ msg: 'Invalid github username' });
    }
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

// @route   GET api/profile/github-graphql/:username-:cursor
// @desc    Get user repos after the cursor
// @access  Public
router.get('/github-graphql/:username/:cursor', async (req, res) => {
  try {
    const repoData = await getRepoInfo(req.params.username, req.params.cursor);
    res.json(repoData);
  } catch (error) {
    if (error.response.errors.type === 'NOT_FOUND') {
      return res.status(404).json({ msg: 'Invalid github username' });
    }
    console.error(error.message);
    return res.status(500).send(config.get('msg-ServerError'));
  }
});

module.exports = router;
