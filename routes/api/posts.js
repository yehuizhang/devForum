const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
// const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { serverError } = require('./helper/errorHandling');

const router = express.Router();

// @route   POST api/posts
// @desc    Create a post
// @access  private
router.post(
  '/',
  [
    auth,
    check('text', 'Text is required')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      return res.json(post);
    } catch (error) {
      serverError(error, res);
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: 'desc' });
    res.json(posts);
  } catch (error) {
    serverError(error, res);
  }
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found!' });
    }
    res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found!' });
    }
    serverError(error, res);
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found!' });
    }
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: 'User is not authorized to delete this post' });
    }
    await post.remove();

    res.json({ message: 'Post removed' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found!' });
    }
    serverError(error, res);
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found!' });
    }

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ message: 'Post already liked' });
    }
    post.likes.push({
      user: req.user.id,
    });
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    serverError(error, res);
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found!' });
    }

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ message: 'Post has not yet been liked' });
    }

    post.likes = post.likes.filter(
      like => like.user.toString() !== req.user.id
    );
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    serverError(error, res);
  }
});

// @route   PUT api/posts/comment/:id
// @desc    Add a comment on post
// @access  Private
router.put(
  '/comment/:id',
  [
    auth,
    check('text', 'Text is required')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.user.id).select('-password');
      if (!post) {
        return res.status(404).json({ message: 'Post not found!' });
      }

      post.comments.push({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      });

      await post.save();
      return res.json(post.comments);
    } catch (error) {
      serverError(error, res);
    }
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    remove the comment from the post
// @access  Private
router.delete('/comment/:id/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found!' });
    }

    const comment = post.comments.find(c => c.id === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment does not exist' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: 'User is not authorized to remove the comment' });
    }

    post.comments = post.comments.filter(c => c.id !== req.params.commentId);
    await post.save();
    return res.json(post.comments);
  } catch (error) {
    serverError(error, res);
  }
});

module.exports = router;
