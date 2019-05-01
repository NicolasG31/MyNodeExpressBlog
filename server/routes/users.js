const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Get user model
let User = require('../models/user');

// Register form
router.get('/register', function (req, res) {
    return res.render('register');
});

// Register proccess
router.post('/register', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    // Check errors
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();
    if (errors) {
        return res.render('register', {
            errors:errors
        });
    }
    let newUser = new User({
        username:username,
        password:password
    });

    // Gets the salt to hash the password
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) {
                console.log(err);
                return;
            }
            newUser.password = hash;
            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                req.flash('success', 'You are now registered');
                return res.redirect('/users/login');
            })
        })
    })
});

// Login form
router.get('/login', function (req, res) {
   return res.render('login');
});

// Login process
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', function (req, res) {
   req.logout();
   req.flash('success', 'Logged out');
   return res.redirect('/')
});

module.exports = router;