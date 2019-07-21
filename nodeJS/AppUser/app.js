const BoxSDK = require('box-node-sdk');
var path = require('path');
const jsonConfig = require(path.resolve(__dirname, "./rajiv-kaki.json"));
const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const okta = require('@okta/okta-sdk-nodejs');

const app = express();
const oktaClient = new okta.Client({
    orgUrl: 'https://dev-397712.oktapreview.com/',
    token: '00yJc92K4T_KgN55t7Cn-_LkiL8L1JflHv_pqM1vGx'    // Obtained from Developer Dashboard
});

var sdk = BoxSDK.getPreconfiguredInstance(jsonConfig);
var serviceAccountClient = sdk.getAppAuthClient('enterprise');

// Pras EID - 59194496
var saToken = sdk.getEnterpriseAppAuthTokens('218955184', null, function (error, token) {
    console.log('Service account token ', token.accessToken);
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
// session support is required to use ExpressOIDC
app.use(session({
    secret: 'this should be secure',
    resave: true,
    saveUninitialized: false
}));
const oidc = new ExpressOIDC({
    issuer: 'https://dev-397712.oktapreview.com:/oauth2/default',
    client_id: '0oaj2tsnyoK5inWRC0h7',
    client_secret: '-slzJ7tER6VprhfjexF2_gVHlqRRmj4g_mURbo79',
    redirect_uri: 'http://localhost:3000/login',
    scope: 'openid profile'
});

// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);

app.get("/logout", (req, res) => {
    res.render('logoff.ejs');
});

app.get('/login', oidc.ensureAuthenticated(), (req, res) => {
    console.log('/login ', req.userContext.userinfo);

    var oktaUID = req.userContext.userinfo.sub;
    var oktaLogin = req.userContext.userinfo.preferred_username;

    let accessToken;
    var userId;
    //var serviceToken = sdk.getEnterpriseAppAuthTokens('57518396').token;
    serviceAccountClient.enterprise.addAppUser(oktaLogin, { external_app_user_id: oktaUID }, function (error, appUser) {
        if (error) {
            console.log('Cannot create app user - user exists ');
            serviceAccountClient.enterprise.getUsers({ 'filter_term': oktaLogin }, function (error, userList) {
                console.log('userList ', userList.entries[0].id);
                for (var i = 0; i < userList.entries.length; i++) {
                    if (userList.entries[i].name == oktaLogin) {
                        userId = userList.entries[i].id;
                        sdk.getAppUserTokens(userId, null, function (error, token) {
                            console.log("User exists ", token.accessToken);
                            res.render('main.ejs', { 'userAccessToken': token.accessToken, 'userId': userId, 'oktaLogin': oktaLogin });

                        });

                    }
                }

            });
        }
        else {
            userId = appUser.id
            console.log('App user created ', userId);

            // user Pras - 3725141744 
            serviceAccountClient.asUser('9352533184');
            //folder  Pras - 82276241308
            serviceAccountClient.collaborations.createWithUserID(userId, '82486768024', serviceAccountClient.collaborationRoles.PREVIEWER);

            oktaClient.getUser(oktaUID)
                .then(user => {
                    user.profile.employeeNumber = userId;
                    user.update();
                    console.log(user);
                });

            sdk.getAppUserTokens(userId, null, function (error, token) {
                console.log("User exists ", token.accessToken);
                res.render('main.ejs', { 'userAccessToken': token.accessToken, 'userId': userId, 'oktaLogin': oktaLogin });

            });

        }
    });
})

//app.listen(8080, () => console.log('Box Node app listening on port 8080!'))

oidc.on('ready', () => {
    app.listen(3000, () => console.log(`Started!`));
});

oidc.on('error', err => {
    console.log('Unable to configure ExpressOIDC', err);
});
