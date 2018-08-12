'use strict';

// [START app]
const express = require('express');
const bodyParser = require('body-parser')

const app = express();

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('login.ejs',{});
});

app.get('/home', (req, res) => {
  res.render('login.ejs',{});
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]