'use strict';

var  util = require('../util');

function deleteByCollectionOrFormat(collection, format) {
  var estimate = 0;
  if(collection) {
    var isNone = ('********none' === collection); // TODO: Need to share the constant with the front end.
    if(!isNone) {
      // TODO: Does this lock the entire collection because it's an update?
      estimate = Number(cts.estimate(cts.collectionQuery([collection]))); // There seems to be something going on with lazy evaluation that requires me to create a number explicitly. Otherwise estimate is always 1. (?)
      xdmp.collectionDelete(collection);
    } else {
      var query = cts.notQuery(cts.collectionQuery(cts.collections()));
      var uris = cts.uris(
        null, null,
        query
      );
      // FIXME: This will fail for large batches
      for(var uri of uris) {
        xdmp.documentDelete(uri);
        estimate++;
      }
    }
    return {collection: collection, estimate: estimate};
  } else if(format) {
    var itr = cts.search(cts.trueQuery(), ['format-' + format]);
    for(var doc of itr) {
      xdmp.documentDelete(fn.documentUri(doc));
      estimate++;
    }
    return {format: format, estimate: estimate};
  } else {
    var db = xdmp.database();
    estimate = Number(cts.estimate(cts.trueQuery()));
    console.warn('Clearing forests for database %s (%s)', xdmp.databaseName(db), db.toString());
    xdmp.forestClear(
      xdmp.databaseForests(db)
    );
    return {estimate: estimate};
  }
}

/**
 * [getDocuments description]
 * @param  {[type]} collections [description]
 * @param  {[type]} formats     [description]
 * @return {[type]}             [description]
 */
function getDocuments(collections, formats, query) {
  var options = [];
  query = query || cts.trueQuery();
  if(collections) {
    collections = [].concat(collections);
    query = cts.collectionQuery(collections);
  }
  if(formats) {
    formats = [].concat(formats);
    options = formats.map(function(format) { return 'format-' + format; });
  }
  // TODO: Parameterize pagination
  // TODO: Order by
  return fn.subsequence(cts.search(query, options), 1, 100);
}

var db = xdmp.getRequestField('db', String(xdmp.database()));
var collections = xdmp.getRequestField('coll', undefined);
var formats = xdmp.getRequestField('format', undefined);

switch (xdmp.getRequestMethod()) {
  case 'GET':
    var getDocs = util.applyAs(getDocuments, {database: db});
    xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
    xdmp.addResponseHeader('X-Request-Timestamp', String(xdmp.requestTimestamp()));
    Array.from(getDocs(collections, formats));
    break;
  case 'DELETE':
    var deleteDocs = util.applyAs(
      deleteByCollectionOrFormat,
      {database: db, transactionMode: 'update-auto-commit'}
    );
    xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
    xdmp.addResponseHeader('X-Request-Timestamp', String(xdmp.requestTimestamp()));
    deleteDocs(collections, formats);
    break;
  default:
    xdmp.setResponseCode(405, 'Method not supported');
}
