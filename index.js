const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const passportSetup = require('./passport-setup');
const flash = require('express-flash');

const pgp = require('pg-promise')({
    // Initialization Options
});

if (process.env.USE_SSL === true) {
    pgp.pg.defaults.ssl = true;
}

const User = require('./models/user');
const UserProgress = require('./models/user-progress');
const UserProgressRoutes = require('./routes/progress-routes');
const UserRoutes = require('./routes/user-routes');

const db = pgp(process.env.DATABASE_URL || 'postgresql://localhost:5432/sql_teaching');

const app = express();
const user = User(db);
const userRoutes = UserRoutes(user);
const userProgress = UserProgress(db);
const userProgressRoutes = UserProgressRoutes(userProgress);

app.use(session({
    secret: 'keyboard cat5 run all 0v3r',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
passportSetup(app, user);

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// app.get('/account', ensureAuthenticated, function (req, res) {
//     res.render('account', { user: req.user });
// });

app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/learn', ensureAuthenticated, function (req, res) {
    res.render('learn', { layout: false });
});

app.get('/progress', [ensureAuthenticated, ensureAdmin], userProgressRoutes.overview);
app.post('/api/track-progress', userProgressRoutes.trackProgress);
app.get('/users', [ensureAuthenticated, ensureAdmin], userRoutes.list);
app.post('/users', [ensureAuthenticated, ensureAdmin], userRoutes.update);

function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated() && req.user.active) {
        return next();
    }
    if (req.user && req.user.newUser) {
        req.flash('info', 'Thanks for registering! You account will be activated soon.');
    } else if (req.user && !req.user.active) {
        req.flash('warning', 'Account not activated yet!');
    } else {
        req.flash('warning', 'Access denied');
    }
    res.redirect('/login');
}

function ensureAdmin (req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }
    req.flash('warning', 'Access denied');
    res.redirect('/login');
}

const PORT = process.env.PORT || 3010;

app.listen(PORT, function () {
    console.log('started on: ', this.address().port);
});
