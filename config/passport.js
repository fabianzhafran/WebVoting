const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ 
      usernameField : 'name',
      passwordField : 'token',
      passReqToCallback : true 
    }, (req, email, password, done) => {
      // Match user
      // console.log(req.body.name);
      User.findOne({
        name : req.body.name, 
        email: req.body.email,
        nrp : req.body.nrp,
        token : req.body.token
      }).then(user => {
        console.log(user);
        if (!user) {
          return done(null, false, { message: 'Wrong credentials' });
        }

        if (user.memilih) {
          return done(null, false, { message : 'Anda sudah memilih'});
        }
        // if (user.name === 'Fabian') {
        //   return done(null, false, {message : 'Admin is not allowed'});
        // }
        return done(null, user);
        // bcrypt.compare(password, user.password, (err, isMatch) => {
        //   if (!err) {
        //     if (isMatch) {
        //       return done(null, user);
        //     } else {
        //       return done(null, false, { message: 'Password incorrect' });
        //     }
        //   }
        // });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
