const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const pgp = require('pg-promise')({
    // Initialization Options
});

const User = require('./user');
const UserProgress = require('./user-progress');

const db = pgp(process.env.DATABASE_URL || 'postgresql://localhost:5432/sql_teaching');

const app = express();
const user = User(db);
const userProgess = UserProgress(db);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


app.use(session({
    secret: 'keyboard cat5 run all 0v3r',
    resave: false,
    saveUninitialized: true
}));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3010/auth/github/callback"
},
    function (accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(async function () {

            // To keep the example simple, the user's GitHub profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the GitHub account with a user record in your database,
            // and return that user instead.

            try {
                let exist = await user.exist(profile.username);
                if (!exist) {
                    await user.createUser(profile.username);
                }
                const currentUser = await user.findByUsername(profile.username);
                return done(null, currentUser);
            }
            catch (err) {
                done(err);
            }

            // console.log(profile);
            
        });
    }
));

app.use(passport.initialize());
app.use(passport.session());

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] }),
    function (req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    });

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/learn');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/', function (req, res) {
    res.render('home', { user: req.user });
});

app.get('/learn', ensureAuthenticated, function (req, res) {
    res.render('learn', { layout: false });
});

app.get('/progress', [ensureAuthenticated, ensureAdmin], function(req, res){
    res.render('progress')
});

app.post('/api/track-progress', async function (req, res) {
    if (!req.isAuthenticated()) {
        return res.json({
            status: 'access-denied'
        });
    }

    const task_name = req.body.task;
    const user_name = req.user.user_name;

    try {

        const params = {
            user_name,
            task_name
        };

        // const result = await db.one('select count(*) from user_progress where user_name = ${user_name} and task_name = ${task_name}', params);
        // if (Number(result.count) === 0) {
        //     await db.none('insert into user_progress (user_name, task_name) values (${user_name}, ${task_name})', params);
        // }

        await userProgess.record(params);

        return res.json({
            status: 'success'
        });

    }
    catch (error) {
        return res.json({
            status: 'error',
            error
        });
    }
});


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.active) {
        return next();
    }
    res.redirect('/login')
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }
    res.redirect('/login')
}

const PORT = process.env.PORT || 3010;

app.listen(PORT, function () {
    console.log("started on: ", this.address().port);
});