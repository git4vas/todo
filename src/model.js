const _ = require('lodash');


// Model
// TODO change to const
let entries = {};
let key = 0;
const incrementKey = () => `pk${++key}`;
const setKey = (newKey) => key = 1 * newKey.substring(2);

// TODO separate Model from Service--provide interface to get list items
const model = {
  setEntries: function(newEntries) {
    // TODO _.merge(entries, JSON.parse(data));
    entries = newEntries;
    setKey(_.keys(entries).pop());
  },

  readEntries: function() {
    return entries;
  },

  readEntry: function(key) {
    if (typeof entries[key] === 'undefined') {
      throw {
        message: `invalid key "${key}"`,
        code: 404
      };
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

  deleteEntry: function(key) {
    if (typeof entries[key] === 'undefined') {
      this._throwError({
        message: `entry ${key} does not exist`,
        code: 404
      });
    }
    else {
      // empty? no -> return error (children exist)
      let hasChildren = false;
      _.forEach(entries, function(entry) {
        if (entry.parent === key) {
          hasChildren = true;
          return false; // break loop (https://lodash.com/docs/4.17.15#forEach)
        }
      });
      if (hasChildren === true) {
        this._throwError({
          message: `entry "${key}" has children, not deleted`,
          code: 400
        });
      }
      delete entries[key];
      console.log(`model: entry "${key}" deleted`);

      return key; // TODO or something else?
    }
  },

  _throwError: function(error) {
    console.log(`throw: ${error.message}`);
    throw error;
  }
};

module.exports = model;
