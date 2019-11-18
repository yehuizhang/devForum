const mongoose = require('mongoose');

const schemaDef = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  experience: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldOfStudy: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
};

const profileFieldsNonReq = ['company', 'website', 'location', 'bio', 'githubUsername'];
profileFieldsNonReq.forEach((field) => {
  schemaDef[field] = {
    type: String,
  };
});

const socialNetsNames = ['youtube', 'twitter', 'facebook', 'linkedin', 'wechat', 'weibo'];
const socialNetsField = {};
socialNetsNames.forEach((field) => {
  socialNetsField[field] = {
    type: String,
  };
});
schemaDef.social = socialNetsField;

const profileSchema = new mongoose.Schema(schemaDef);

module.exports = {
  Profile: mongoose.model('Profile', profileSchema),
  profileFieldNamesNonReq: profileFieldsNonReq,
  profileFieldSocial: socialNetsNames,
};
