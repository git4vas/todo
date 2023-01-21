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
 * Model    HTTP/REST   Path        Input       code    Output  
 * ===================================================================================
 * Create   POST        collection  new entry   201     entry*, location:entry-path        
 * Read     GET         collection  -none-      200     entry[]
 * Read     GET         entry       -none-      200     entry
 * Update   PUT         entry       entry       200     entry*
 * Delete   DELETE      entry       -none-      200?    -none-
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
    let returnCode = 500;
    const newEntry = req.body;

    if (typeof entries[newEntry.parent] === 'undefined') {
        returnCode = 400;
        res.status(returnCode)
            .end();
        console.error(`the parent entry (key: "${req.body.parent}") does not exist, entry not created`);
    }
    else {
        const strKey = incrementKey();
        entries[strKey] = {
            text: newEntry.text,
            // TODO validate text: transform to string
            flag: !!newEntry.flag,
            parent: newEntry.parent || null
        };

        res.setHeader('Content-Type', 'application/json')
            .setHeader('Location', `/entry/${strKey}`)
            .status(201)
            .send(JSON.stringify(entries[strKey]));        
    }
    // TODO res.send() once
});
//console.log(req.query);


// delete entry
app.delete('/entry/:key', function (req, res) {
    let returnCode = 500;
    console.log(`request to delete record ${req.params.key} received`);
    // check existence of entry (validate input) if does not exist -> return error
    if (typeof entries[req.params.key] === 'undefined') {
        console.error(`record ${req.params.key} does not exist`);
        returnCode = 404;
    }
    else {
        // empty? no -> return error (children exist)
        let hasChildren = false;
        _.forEach(entries, function(entry) {
            if (entry.parent === req.params.key) {
                hasChildren = true;
                return false; // break loop (https://lodash.com/docs/4.17.15#forEach)
            }
        });
        if (hasChildren === true) {
            console.error(`entry "${req.params.key}" has children, not deleted`);
        }
        else{
            delete entries[req.params.key];
            returnCode = 200;
            console.log(`record ${req.params.key} deleted`);
        }            
    }


    // // TODO delete entry -r


    res.status(returnCode)
        .end();
});


// TODO overwrite file on data change

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
