const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const joi = require('@hapi/joi');
const config = require('../config');

const VerifyToken = require('../shared/VerifyToken');
const User = require('../models/User');

//Register
router.post('/register', function (req, res) {
  
  const schema = joi.object().keys({
    name: joi.string().required(),
    email: joi.string().required(),
    password:  joi.string().required()
  });

  const result = schema.validate(req.body);
  if (result.error) {
     return res.status(400).send(result.error.message);
  }

  User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user`.");

      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

      res.status(200).send({ auth: true, token: token });
    });

});

//login
router.post('/login', function (req, res) {

  const schema = joi.object().keys({
    email: joi.string().required(),
    password:  joi.string().required()
  });
  
  const result = schema.validate(req.body);
  if (result.error) {
     return res.status(400).send(result.error.message);
  }

  User.findOne({ email: req.body.email }, async (err, user) => {

    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    const passwordIsValid = await user.checkPassword(req.body.password)
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token });
  });

});

//logout
router.post('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

//me
router.get('/me', VerifyToken, function (req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

module.exports = router;