'use strict'
declareUpdate();

var  util = require('../util');

function deleteByCollectionOrFormat(collection, format) {
  var estimate = 0;
  if(collection) {
    var isNone = ('********none' === collection); // TODO: Need to share the constant with the front end.
    if(!isNone) {
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

if('DELETE' === xdmp.getRequestMethod()) {
  var db = xdmp.getRequestField('db', xdmp.database().toString());
  var collection = xdmp.getRequestField('coll');
  var format = xdmp.getRequestField('format');

  var deleteDocs = util.applyAs(deleteByCollectionOrFormat, {database: db, transactionMode: 'update-auto-commit'});

  xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
  deleteDocs(collection, format);
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
