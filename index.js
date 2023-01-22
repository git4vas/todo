const express = require('express');
const fs = require('fs');
const _ = require('lodash');


// Model
const entries = {};
let key = 0;
const incrementKey = () => `pk${++key}`;
const setKey = (newKey) => key = 1 * newKey.substring(2);

// TODO separate Model from Service--provide interface to get list items
const model = {
    readEntries: function() {
        return entries;
    },

    readEntry: function(key) {
        if (typeof entries[key] === 'undefined') {
            throw {
                message: `invalid key "${key}"`,
                code: 404
            }
        }
        return entries[key];
    },

    createEntry: function(newEntry) {
        if (newEntry.parent !== null && typeof entries[newEntry.parent] === 'undefined') {
            this._throwError({
                message: `invalid parent key "${newEntry.parent}", entry not created`,
                code: 400
            });
        }

        const newKey = incrementKey();
        entries[newKey] = {
            text: newEntry.text,
            flag: !!newEntry.flag,
            parent: newEntry.parent || null
        };

        return newKey;
    },

    // edit entry in collection
    /**
     *  If an existing resource is modified,
     *  either the 200 (OK)
     *  or 204 (No Content)
     *  response codes SHOULD be sent to indicate successful completion of the request.
     *  [tutorial](https://restfulapi.net/http-methods/)
    */
    updateEntry: function(key, updEntry) {
        // const updEntry = req.body;

        if (typeof entries[key] === 'undefined') {
            this._throwError({
                message: `record "${key}" does not exist, nothing changed`,
                code: 404
            });
        }
        else if (typeof entries[updEntry.parent] === 'undefined') {
            this._throwError({
                message: `parent entry "${updEntry.parent}" does not exist, entry not updated`,
                code: 400
            });
        }

        // update entry
        entries[key] = updEntry;
        console.log(`model: entry "${key}" updated`);

        return updEntry;
    },

    _throwError: function(error) {
        console.log(`throw: ${error.message}`);
        throw error;
    }
};

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


const sendError = (error, response) => {
    response.status(error.code)
        .end();
    console.error(`sent error: ${error.code} ${error.message}`);
};

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain')
        .status(200)
        .send('Hello World! now it\'s ' + new Date());
    //res.status(200).json('something else');
});

// Read collection
app.get('/entry', function (req, res) {
    try{
        const list = model.readEntries();
        res.setHeader('Content-Type', 'application/json')
            .status(200)
            .send(JSON.stringify(list));
        console.log(`responded: collection ${JSON.stringify(list)}`);
        //console.log(req.query);
    }
    catch(exc) {
        sendError(exc, res);
    }
});

// Read entry
app.get('/entry/:key', function (req, res) {
    try{
        console.log(`entry "${req.params.key}" requested`);
        const item = model.readEntry(req.params.key); // TODO ask why this var--to catch exception HERE?
        res.setHeader('Content-Type', 'application/json')
            .status(200)
            .send(JSON.stringify(item));
        console.log(`responded: entry ${JSON.stringify(item)}`);
    }
    catch(exc) {
        sendError(exc, res);
    }
});


// Create entry in collection
app.post('/entry', function (req, res) {
    //let returnCode = 500;
    try {
        console.log(`entry creation requested: ${req.body}`);
        const key = model.createEntry(req.body);
        res.setHeader('Content-Type', 'application/json')
            .setHeader('Location', `/entry/${key}`)
            .status(201)
            .send(JSON.stringify(entries[key]));
        console.log(`responded: entry "${key}" created successfully`);
    }
    catch(exc) {
        sendError(exc, res);
    }
});


// TODO res.send() once



app.put('/entry/:key', function (req, res) {
    // let returnCode = 500;
    console.log(`request to change record ${req.params.key} received`);
    try {
        model.updateEntry(req.params.key, req.body);
        res.status(204)
            .end();
        console.log(`responded: entry "${req.params.key}" updated`);        
    }
    catch (exc) {
        sendError(exc, res);
    }
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
