module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Tolong log-in terlebih dahulu.');
    res.redirect('/users/login');
  },
  ensureNotVoted : async function(req, res, next) {
    console.log(req.user);
    if (!req.user.memilih && req.user.name !== 'admin' && req.user.nrp !== -1) {
      return next();
    }
    if (req.user.name === 'admin' && req.user.nrp === -1) {
      req.flash('error_msg', 'Anda adalah admin');
      res.redirect('/dashboard');
    } else {
      req.flash('error_msg', 'Anda sudah memilih.');
      res.redirect('/users/voting')
    }
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/users/voting');      
  },
  voterAuthenticated : function(req, res, next) {
    if (req.user.name !== 'admin') {
      req.user.memilih = true;
      return next();
    }
    req.flash('error_msg', 'Admin tidak bisa mengakses page voting.');
    res.redirect('/dashboard');
  },
  adminAuthenticated : function (req, res, next) {
    if (req.user.name === 'admin' && req.user.nrp === '-1') {
      return next();
    }
    req.flash('error_msg', 'Anda bukan admin');
    res.redirect('/users/voting');
  }
};
 