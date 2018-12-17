'use strict';

// [START app]
const express = require('express');
const bodyParser = require('body-parser')


const app = express();

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/explorer', (req, res) => {
    var token = req.query.token;
    console.log('token -- ',token);
    res.render('explorer.ejs', {token});
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
// [END app]