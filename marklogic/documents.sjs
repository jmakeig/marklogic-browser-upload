'use strict'

var  util = require('util');
var  stats = require('stats');

if('DELETE' === xdmp.getRequestMethod()) {
  var db = xdmp.getRequestField('db', xdmp.database().toString());
  var collection = xdmp.getRequestField('coll');

  var collectionDelete = util.applyAs(xdmp.collectionDelete, {database: db, transactionMode: 'update-auto-commit'});
  var estimate = util.applyAs(cts.estimate, {database: db});
  var getDatabaseStats = util.applyAs(stats.getDatabaseStats, {database: db, isolation: 'different-transaction'});

  var before = estimate(cts.collectionQuery(collection), 'document');
  if(collection) {
    collectionDelete(collection);
  }

  xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
  getDatabaseStats(db);
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
