// Const to initialize modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');


// Database
mongoose.connect(config.database);
let db = mongoose.connection;
db.once('open', function () {
    console.log('Connected to MongoDB');
});
db.on('error', function (err) {
    console.log(err);
});

// Init app
const app = express();
// Get models
let Article = require('./models/article');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser to get articles variables
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, '../public')));

// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express messages middleware
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express validator
app.use(expressValidator());

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
   res.locals.user = req.user || null;
   next();
});

// Home route
app.get('/', (req, res, next) => {
    Article.find({}, function (err, articles) {
        if (err) {
            console.log(err);
        }
        else {
            return res.render('index', {
                title:'Articles',
                articles: articles
            });
        }
    }).limit(10).sort('-_id');
});

// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start server listening on port 3000
app.listen(3000, function() {
    console.log('Server started on port 3000');
});

module.exports = app;
