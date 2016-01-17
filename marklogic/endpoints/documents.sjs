'use strict'
declareUpdate();

var  util = require('../util');

function deleteByCollectionOrFormat(collection, format) {
  if(collection) {
    if('********none' !== collection) {
      xdmp.collectionDelete(collection);
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
    return {collection: collection};
  } else if(format) {
    var itr = cts.search(cts.trueQuery(), ['format-' + format]);
    for(var doc of itr) {
      xdmp.documentDelete(fn.documentUri(doc));
    }
    return {format: format};
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
