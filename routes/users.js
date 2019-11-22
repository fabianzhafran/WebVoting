const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const EmailService = require('../emails/account');
// Load User model
const User = require('../models/User');
const Pilihan = require('../models/Votee');
const { forwardAuthenticated, ensureAuthenticated, ensureNotVoted } = require('../config/auth');

// Random string generator
const makeString = require('../js/randomString');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
// router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  // console.log(req.body);
  const { name, email, nrp } = req.body;
  let errors = [];

  if (!name || !email || !nrp) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      nrp
    });
  } else {
    User.findOne({ email : email }).then(user => {
      if (user) {
        errors.push({ msg: 'Sudah ada pengguna dengan email itu.' });
        res.render('register', {
          errors,
          name,
          email,
          nrp
        });
      } else {
        
        let token = makeString(10);

        console.log(token);
        const newUser = new User({
          name,
          email,
          nrp,
          token,
          memilih : false
        });

        newUser
          .save()
          .then(user => {
            req.flash(
              'success_msg',
              `Akan dikirim email ke ${email}. Tolong dicek (mungkin di spam) untuk mendapatkan token.`
            );
            EmailService.sendEmail(name, email, nrp, token);
            res.redirect('/users/login');
          })
          .catch(err => console.log(err));
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  // console.log(req.body);
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    successRedirect: '/users/voting',
    failureFlash: true
  }) (req, res, next);
});

// Logout
router.get('/logout', ensureAuthenticated,  (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have voted!');
  res.redirect('/users/login');
});

// Voting
router.get('/voting', ensureAuthenticated, (req, res) => {
  res.render('vote');
})

router.post('/voting', ensureAuthenticated, ensureNotVoted, async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);
    const pilihan = await new Pilihan({
      pilihan : req.body.product,
      pemilih : req.user.name
    });
    await pilihan.save();
    req.user.memilih = true;
    await req.user.save();

    req.flash('success_msg', `Anda telah memilih!`);
    res.redirect('/users/logout');
  } catch (e) {
    console.log(e);
    res.render('vote', {
      error : e
    })
  }
})

module.exports = router;
