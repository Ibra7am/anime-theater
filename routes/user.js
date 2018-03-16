var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');
router.use(csrfProtection);
var Order = require('../models/order');
var Cart = require('../models/cart');

/* GET users listing. */
router.get('/user', function(req, res, next) {
  res.render('user/signup');
});

router.get('/profile', isLoggedIn, function (req, res, next) {
  Order
    .find({
      user: req.user
    }, function (err, orders) {
      if (err) {
        return res.write('Error!');
      }
      var cart;
      orders.forEach(function (order) {
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
      res.render('user/profile', {orders: orders});
    });
});

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logOut();
  res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
  next();
});

router.get('/login', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/login', {
    title: 'login',
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post('/login', passport.authenticate('local.signin', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}), function (req, res, next) {

  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }

});

router.get('/signup', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', {
    title: 'signup',
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}), function (req, res, next) {

  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }

});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}


module.exports = router;
