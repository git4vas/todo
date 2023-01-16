const express = require('express');
const fs = require('fs');

const app = express();


let entries = {};

const readData = (err, data) => {
    if(err){
        console.error(err);
    }
    else {
        console.log(data);
        entries = JSON.parse(data);        
    }
};




fs.readFile('./data/list.json', 'utf-8', readData);

//const entries = {
//    pk1: { text: 'hello', flag: false, parent: null },
//    pk2: { text: 'hello2', flag: true, parent: null },
//    pk3: { text: 'hello2', flag: true, parent: 'pk1' }
//};



app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain')
        .status(200)
        .send('Hello World! now it\'s ' + new Date());
    //res.status(200).json('something else');
});

app.get('/entry', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
        .send(JSON.stringify(entries));
    console.log(entries);
    console.log(req.query);    
});

app.get('/entry/:key', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(entries[req.params.key]));
});



app.listen(8080, function () {
    console.log('Running on port 8080!');
});