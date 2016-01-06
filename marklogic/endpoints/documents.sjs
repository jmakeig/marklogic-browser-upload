'use strict'

var  util = require('../util');

if('DELETE' === xdmp.getRequestMethod()) {
  var db = xdmp.getRequestField('db', xdmp.database().toString());
  var collection = xdmp.getRequestField('coll');

  var collectionDelete = util.applyAs(xdmp.collectionDelete, {database: db, transactionMode: 'update-auto-commit'});
  if(collection) {
    collectionDelete(collection);
  }
  xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
  ({collections: [collection]});
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
