const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, adminAuthenticated } = require('../config/auth');
const Pilihan = require('../models/Votee');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('register');
  console.log('yes');
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, adminAuthenticated, async (req, res) => {
  try { 
    let countFanniaty = 0;
    let countNopia = 0;


    const pilihanFanniaty = await Pilihan.countDocuments({ pilihan : 'Fanniaty Putri'}, (err, count) => {
      console.log('~~~~~~~PILIHAN LOGS~~~~~~~');
      console.log('Fanniaty : ' + count);
      countFanniaty = count;
    });
    const pilihanNopia = await Pilihan.countDocuments({ pilihan : 'on'}, (err, count) => {
      console.log('Nopia  : ' + count);
      countNopia = count;
    });  

    res.render('dashboard', {
      user: req.user,
      countFanniaty : countFanniaty,
      countNopia : countNopia
    });
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

module.exports = router;
