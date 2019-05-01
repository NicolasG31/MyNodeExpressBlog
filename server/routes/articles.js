const express = require('express');
const router = express.Router();

// Get models
let Article = require('../models/article');
let User = require('../models/user');

// Add article page route
router.get('/add', ensureAuthenticated, function (req, res) {
    return res.render('add_article', {
        title:'Add an article'
    });
});

// Load edit form
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not authorized');
            return res.redirect('/');
        }
        return res.render('edit_article', {
            title:'Edit Article',
            article:article
        });
    })
});

// Add submit POST route
router.post('/add', function (req, res) {
    // Checking
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();
    // Get the errors
    let errors = req.validationErrors();
    if(errors) {
        return res.render('add_article', {
            title:'Add an article',
            errors:errors
        });
    }
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        req.flash('success', 'Article added');
        return res.redirect('/');
    })
});

// Update submit POST route
router.post('/edit/:id', function (req, res) {
    // Getting the article from the request
    let article = {};
    article.title = req.body.title;
    article.body = req.body.body;
    // Checking
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();
    // Get the errors
    let errors = req.validationErrors();
    if(errors) {
        return res.render('edit_article', {
            title:'Edit Article',
            article:article,
            errors:errors
        });
    }
    let query = {_id:req.params.id};
    Article.updateOne(query, article, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        req.flash('success', 'Article updated');
        return res.redirect('/');
    })
});

// Delete article
router.delete('/:id', function (req, res) {
    if (!req.user._id) {
        return res.status(500).send();
    }
    let query = {_id:req.params.id};
    Article.findById(req.params.id, function (err, article) {
       if (article.author != req.user._id) {
           return res.status(500).send();
       }
    });

    Article.deleteOne(query, function (err) {
        if (err) {
            console.log(err);
        }
        req.flash('success', 'Article deleted');
        return res.send('Success');
    })
});

// Get an article
router.get('/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        User.findById(article.author, function (err, user) {
            return res.render('article', {
                article: article,
                author: user.username
            });
        });
    })
});

// Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;