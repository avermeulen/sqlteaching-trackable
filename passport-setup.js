const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = function (app, user) {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://localhost:3010/auth/github/callback'
    }, function (accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(async function () {
            try {
                const currentUser = await user.findOrCreateUser(profile);
                return done(null, currentUser);
            } catch (err) {
                done(err);
            }
        });
    }));

    app.use(passport.initialize());
    app.use(passport.session());

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
};
