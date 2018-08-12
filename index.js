const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const passportSetup = require('./passport-setup');

const pgp = require('pg-promise')({
    // Initialization Options
});

if (process.env.USE_SSL === true) {
    pgp.pg.defaults.ssl = true;
}

const User = require('./models/user');
const UserProgress = require('./models/user-progress');

const db = pgp(process.env.DATABASE_URL || 'postgresql://localhost:5432/sql_teaching');

const app = express();
const user = User(db);


const userProgress = UserProgress(db);

app.use(session({
    secret: 'keyboard cat5 run all 0v3r',
    resave: false,
    saveUninitialized: true
}));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
passportSetup(app, user);
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/learn', ensureAuthenticated, function (req, res) {
    res.render('learn', { layout: false });
});

app.get('/progress', [ensureAuthenticated, ensureAdmin], async function (req, res) {
    const progressList = await userProgress.overview();
    res.render('progress', {progressList});
});

app.post('/api/track-progress', async function (req, res) {
    if (!req.isAuthenticated()) {
        return res.json({
            status: 'access-denied'
        });
    }

    const taskName = req.body.task;
    const userName = req.user.user_name;

    try {
        const params = {
            user_name: userName,
            task_name: taskName
        };

        await userProgress.record(params);

        return res.json({
            status: 'success'
        });
    } catch (error) {
        return res.json({
            status: 'error',
            error
        });
    }
});

function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated() && req.user.active) {
        return next();
    }
    res.redirect('/login');
}

function ensureAdmin (req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }
    res.redirect('/login');
}

const PORT = process.env.PORT || 3010;

app.listen(PORT, function () {
    console.log('started on: ', this.address().port);
});
