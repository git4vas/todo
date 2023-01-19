const express = require('express');
const fs = require('fs');
const _ = require('lodash');


// Model
const entries = {};
let key = 0;
const incrementKey = () => `pk${++key}`;
const setKey = (newKey) => key = 1 * newKey.substring(2);

// Service
const app = express();
// body-parser
app.use(express.json());

//const entries = {
//    pk1: { text: 'hello', flag: false, parent: null },
//    pk2: { text: 'hello2', flag: true, parent: null },
//    pk3: { text: 'hello2', flag: true, parent: 'pk1' }
//};


/**
 * Model    HTTP/REST   URI-path (resat, http)
 * ===========================================
 * Create   POST      collection
 * Read     GET         collection
 * Read     GET         entry
 * Update   PUT         entry
 * Delete   DELETE      entry
 */


app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain')
        .status(200)
        .send('Hello World! now it\'s ' + new Date());
    //res.status(200).json('something else');
});

app.get('/entry', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
        .status(200)
        .send(JSON.stringify(entries));
    console.log(entries);
    //console.log(req.query);
});

app.get('/entry/:key', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
        .status(200)
        .send(JSON.stringify(entries[req.params.key]));
});

// create entry in collection
app.post('/entry', function (req, res) {
    const newEntry = req.body;
    const strKey = incrementKey();
    entries[strKey] = {
        text: newEntry.text,
        flag: !!newEntry.flag,
        parent: newEntry.parent || null
    };
    res.setHeader('Content-Type', 'application/json')
        .setHeader('Location', `/entry/${strKey}`)
        .status(201)
        .send(JSON.stringify(entries[strKey]));        
});
//console.log(req.query);

const startServer = (port) => {
    app.listen(port, () => {
        console.log('Running on port 8080!');
    });
};

const readData = (err, data) => {
    if(err){
        console.error(err);
    }
    else {
        console.log('read from file:\n', data);
        try {
            _.merge(entries, JSON.parse(data));
            setKey(_.keys(entries).pop());
            console.log('data parsed');
            startServer(8080);
            // TODO process.env.PORT || 8080
        }
        catch(errJSON){
            console.error(errJSON);
        }
    }
};


fs.readFile('./data/list.json', 'utf-8', readData);

//fs.appendFile('./data/list.json', writeData);
