const express = require('express');

// Service
const app = express();
// body-parser
app.use(express.json());

// TODO refactor
let model = {};


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
  console.log(`sent error: ${error.code} ${error.message}`);
};

// TODO res.send() once


// root
// TODO log 404 requests with invalid url
app.get('/', function(req, res) {
  console.log('new request');
  res.setHeader('Content-Type', 'text/plain')
    .status(200)
    .send('Hello World! now it\'s ' + new Date());
  console.log('responded with current date');
  //res.status(200).json('something else');
});

// Read collection
app.get('/entry', function(req, res) {
  try {
    console.log('list of entries requested');
    const list = model.readEntries();
    res.setHeader('Content-Type', 'application/json')
      .status(200)
      .send(JSON.stringify(list));
    console.log(`responded: collection ${JSON.stringify(list)}`);
    //console.log(req.query);
  }
  catch (exc) {
    sendError(exc, res);
  }
});

// Read entry from collection
app.get('/entry/:key', function(req, res) {
  try {
    console.log(`entry "${req.params.key}" requested`);
    const item = model.readEntry(req.params.key); // TODO ask why this var--to catch exception HERE?
    res.setHeader('Content-Type', 'application/json')
      .status(200)
      .send(JSON.stringify(item));
    console.log(`responded: entry ${JSON.stringify(item)}`);
  }
  catch (exc) {
    sendError(exc, res);
  }
});

// Create entry in collection
app.post('/entry', function(req, res) {
  //let returnCode = 500;
  try {
    console.log(`entry creation requested: ${JSON.stringify(req.body)}`);
    const key = model.createEntry(req.body);
    res.setHeader('Content-Type', 'application/json')
      .setHeader('Location', `/entry/${key}`)
      .status(201)
      .send(JSON.stringify(model.readEntry(key)));
    console.log(`responded: entry "${key}" created successfully`);
  }
  catch (exc) {
    sendError(exc, res);
  }
});

// Update entry in collection 
app.put('/entry/:key', function(req, res) {
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
// // TODO delete entry -r
app.delete('/entry/:key', function(req, res) {
  // let returnCode = 500;
  console.log(`request to delete record ${req.params.key} received`);
  try {
    model.deleteEntry(req.params.key);
    res.status(200)
      .end();
    console.log(`responded: entry "${req.params.key}" deleted`);
  }
  catch (exc) {
    sendError(exc, res);
  }
});


// TODO overwrite file on data change
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
  });
};

module.exports = {
  setModel: (newModel) => {
    model = newModel;
  },
  startServer: startServer
};
