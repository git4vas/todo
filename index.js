// TODO import instead
const fs = require('fs');

const model = require('./src/model');
const service = require('./src/service');

// TODO change to promise in model
const readData = (err, data) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log('read from file:\n', data);
        try {
            model.setEntries(JSON.parse(data));
            console.log('data parsed');
            service.setModel(model);
            service.startServer(80);
            // TODO process.env.PORT || 8080
        }
        catch (errJSON) {
            console.error(errJSON);
        }
    }
};


fs.readFile('./data/list.json', 'utf-8', readData);

//fs.appendFile('./data/list.json', writeData);
