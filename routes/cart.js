var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);
var Cart = require('../models/cart');
var Product = require('../models/product');

router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart
      ? req.session.cart
      : {});
  
    Product.findById(productId, function (err, product) {
      if (err) {
        return res.redirect('/');
      }
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect('/shop');
    });
  });
  
  router.get('/reduce/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart
      ? req.session.cart
      : {});
  
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart')
  });
  
  router.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart
      ? req.session.cart
      : {});
  
    cart.removeAll(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart')
  });
  
  router.get('/increment/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart
      ? req.session.cart
      : {});
  
    cart.incrementByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart')
  });

  module.exports = router;