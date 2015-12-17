'use strict'

var  util = require('util');

if('DELETE' === xdmp.getRequestMethod()) {
  var db = xdmp.getRequestField('db', xdmp.database().toString());
  var collection = xdmp.getRequestField('coll');

  var collectionDelete = util.applyAs(xdmp.collectionDelete, {database: db, transactionMode: 'update-auto-commit'});
  var estimate = util.applyAs(cts.estimate, {database: db});

  var before = estimate(cts.collectionQuery(collection), 'document');
  if(collection) {
    collectionDelete(collection);
  }
  xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
  before;
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
