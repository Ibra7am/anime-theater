var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');
router.use(csrfProtection);
var nodemailer = require('nodemailer');
var Order = require('../models/order');
var Cart = require('../models/cart');
var Product = require('../models/product');

/* GET home page. */
router.get('/', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  res.render('entity/index', {
    title: 'Home',
    successMsg: successMsg,
    noMessages: !successMsg
  });
});

// SHOP
router.get('/shop', function (req, res, next) {
  Product
    .find(function (err, docs) {
      var productChunks = [];
      var chunkSize = 4;
      for (var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render('entity/shop', {
        title: 'shop',
        productsArr: productChunks
      });
    });
});

router.get('/shopping-cart', function (req, res, next) {

  if (!req.session.cart) {
    return res.render('entity/shopping-cart', {
      products: null,
      title: 'shopping-cart'
    });
  }
  var cart = new Cart(req.session.cart);
  res.render('entity/shopping-cart', {
    csrfToken: req.csrfToken(),
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    title: 'shopping-cart'
  });

});

router.get('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }

  var errMsg = req.flash('error')[0];
  var cart = new Cart(req.session.cart);
  res.render('entity/checkout', {
    title: 'checkout',
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    csrfToken: req.csrfToken(),
    errMsg: errMsg,
    noErrors: !errMsg

  });
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")("sk_test_R1mzRYePnkuofy22YGr5pfYj");
  console.log('index, stripe start');

  stripe
    .charges
    .create({
      amount: cart.totalPrice * 100,
      currency: "usd",
      source: req.body.stripeToken, // obtained with Stripe.js
      description: "Charge for mia.taylor@example.com"
    }, function (err, charge) {
      if (err) {
        console.log('index, stripe charge err');
        req.flash('error', err.message);
        return res.redirect('/checkout');
      }
      console.log('index, stripe charge success');

      var order = new Order({user: req.user, cart: cart, address: req.body.address, name: req.body.name, paymentId: charge.id});
      order.save(function (err, result) {

      var cart = new Cart(order.cart);
      order.items = cart.generateArray();

      var titles = [];
      var quantity = [];
      var price = [];

      order.items.forEach(function(item) {
        titles.push(item.item.title);
        quantity.push(item.qty);
        price.push(item.price);
      });
      console.log(order.user.name);
      console.log(order.user.phoneNumber);
      
      console.log('-------------');
      console.log('-------------');
      console.log(titles);
      console.log('------------');
      console.log(quantity);
      console.log('-------------');
      console.log(price);
      console.log('-------------');
      console.log('-------------');
      console.log(cart.totalPrice);  
      console.log('-------------');          
      console.log(cart.totalQty);      

      console.log('-------------');          
      console.log('-------------');          
      console.log('-------------');          
      console.log('-------------');          
      
      var allOrders = '';
      for(var i = 0; i < titles.length ; i++){
          allOrders += (i+1) + '- item: ' + titles[i] + ' Quantity: ' + quantity[i] + ' Price: ' + price[i] + '<br />';
      }




      var emailMsg =  '<h1 style="text-align: left;"><span style="color: #999999;">A</span><span style="color: #ff6600;">nime</span> <span style="color: #999999;">T</span><span style="color: #ff6600;">heater</span> <span style="font-size: 13px">Service</span> </h1>'
      +'<p style="text-align: left; font-size: 14px">Hello Boss,</p> '
      +'<p><span style="color: #00cc00;"><strong><span style="text-align: left; font-size: 14px">We have a new order!</span></strong></span></p>'
      +'<p><span style="text-align: left;">________</span></p>'
      +'<p><strong><span style="text-align: left; font-size: 18px">Customer: <br /></span></strong></p>'
      +'<p><span style="text-align: left; font-size: 14px">name: '+ order.user.name +'</span></p>'
      +'<p><span style="text-align: left; font-size: 14px">phone number: '+ order.user.phoneNumber +'</span></p>'
      +'<p><span style="text-align: left; font-size: 14px">E-mail: '+ order.user.email +'</span></p>'
      +'<p><span style="text-align: left; font-size: 14px">Address: '+ order.user.address +'</span></p>'
      +'<p><span style="text-align: left; font-size: 18px"><strong>Order:</strong></span></p>'
      +'<p><span style="text-align: left; font-size: 14px">'+ allOrders +'</span></p>'
      +'<p>&nbsp;</p>'
      +'<p><span style="text-align: left; font-size: 14px"><strong>Total Quantity: </strong>'+ cart.totalQty +'</span></p>'
      +'<p><span style="text-align: left; font-size: 14px"><strong>Total Price: </strong>'+ cart.totalPrice +'</span></p>'
      +'<p><span style="text-align: left; font-size: 14px">________</span></p>'







      console.log('Orders: ');          
      console.log(allOrders);          
      

            // Send mail create reusable transport method (opens pool of SMTP connections)
      var smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "anime.theater.service@gmail.com",
          pass: "@834326@"
        }
      });

      
      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"Anime Theater"  <anime.theater.service@gmail.com>', // sender address
        to: "yousefalghofili@hotmail.com", // list of receivers
        subject: "New Order from ", // Subject line
        text: "Hello world", // plaintext body
        html: emailMsg // html body
      }

      // send mail with defined transport object
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          return console.log(error);
        } else {
          console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following
        // line smtpTransport.close(); // shut down the connection pool, no more
        // messages
      });









        req.flash('success', 'Item/s successfully bought');
        req.session.cart = null;
        res.redirect('/');
      });
    });

 

  // // Twilio Credentials
  // const accountSid = 'ACc5b795a997199b1a84225cfcdf8987f8';
  // const authToken = 'f5ab5d166d774fa1c37c3c8fe14c7516';

  // // require the Twilio module and create a REST client
  // const client = require('twilio')(accountSid, authToken);

  // client
  //   .messages
  //   .create({to: '+1966500853023', from: '+18082022785 ', body: 'This is the ship that made the Kessel Run in fourteen parsecs?'})
  //   .then(message => console.log(message.sid));

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
