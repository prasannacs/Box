'use strict';

// [START app]
const express = require('express');
const bodyParser = require('body-parser')
var services = require('./services/eventAdmin');


const app = express();

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('login.ejs',{});
});

app.get('/home', (req, res) => {
  res.render('home.ejs',{});
});

app.post('/home', (req, res) => {
    console.log(req.body)
    res.render('home.ejs',{});
})


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
