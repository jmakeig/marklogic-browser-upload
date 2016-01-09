'use strict'
declareUpdate();

var  util = require('../util');

if('DELETE' === xdmp.getRequestMethod()) {
  var db = xdmp.getRequestField('db', xdmp.database().toString());
  var collection = xdmp.getRequestField('coll');

  var collectionDelete = util.applyAs(xdmp.collectionDelete, {database: db, transactionMode: 'update-auto-commit'});
  if(collection) {
    if('********none' !== collection) {
      collectionDelete(collection);
    } else {
      console.log('Collection: %s', collection);
      var uris = cts.uris(
        null, null,
        cts.notQuery(cts.collectionQuery(cts.collections()))
      );
      // FIXME: This will fail for large batches
      for(var uri of uris) {
        xdmp.documentDelete(uri);
      }
    }
  }
  xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
  ({collections: [collection]});
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
