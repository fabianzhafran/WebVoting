const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const EmailService = require('../emails/account');
// Load User and Pilihan model
const User = require('../models/User');
const Pilihan = require('../models/Votee');
const { forwardAuthenticated, ensureAuthenticated, ensureNotVoted, voterAuthenticated } = require('../config/auth');

// Random string generator
const makeString = require('../js/randomString');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

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

// Login POST method
router.post('/login', 
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash : true
  }), (req, res) => {
    if (req.user.name === 'admin') {
      res.redirect('/dashboard');
    }
    if (req.user.isAdmin !== 'admin') {
      res.redirect('/users/voting');
    }
  }
);

// Logout
router.get('/logout', ensureAuthenticated, (req, res) => {
  if (req.user.name !== 'admin') {
    req.flash('success_msg', 'You have voted!');
  }
  req.logout();
  res.redirect('/users/login');
});

// Voting Page
router.get('/voting', ensureAuthenticated,  voterAuthenticated, (req, res) => {
  res.render('vote');
})

// Voting POST
router.post('/voting', ensureAuthenticated, ensureNotVoted, voterAuthenticated, async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);
    let username = req.user.name;
    const pilihan = await new Pilihan({
      pilihan : req.body.product,
      pemilih : req.user.name
    });
    await pilihan.save();
    await req.user.save();

    req.logout();
    // console.log('ANJING');
    res.render('done', {
      name : username
    });
  } catch (e) {
    console.log(e);
    res.render('vote', {
      error : e
    })
  }
})

module.exports = router;
