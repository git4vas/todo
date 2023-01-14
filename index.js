const { text } = require('express');
var express = require('express');
var app = express()

app.get('/', function (req, res) {
  res.setHeader("Content-Type" , "text/plain")
  res.send('Hello World!' + new Date());
});
app.listen(8080, function () {
  console.log('Running on port 8080!')
});