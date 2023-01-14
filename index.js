const express = require('express');
const app = express()

const entries = {
    pk1: {text: 'hello', flag: false, parent: null},
    pk2: {text: 'hello2', flag: true, parent: null}
}



app.get('/', function (req, res) {
  res.setHeader("Content-Type" , "text/plain")
  res.send('Hello World!' + new Date());
});

app.get('/entry', function (req, res) {
  res.setHeader("Content-Type" , "application/json")
  res.send(JSON.stringify(entries));
});

app.listen(8080, function () {
  console.log('Running on port 8080!')
});