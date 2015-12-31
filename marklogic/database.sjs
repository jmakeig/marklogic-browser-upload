'use strict'
var stats = require('./stats.sjs')

if('GET' === xdmp.getRequestMethod()) {
  /**
    GET database stats:
      - Name
      - Documents count
      - Properties count
      - For each user collection: Name and document count, ordered by count (default) or name, ascending or descending (default)
      - Same for system (batch) collections
  */
  var id = xdmp.getRequestField('id', xdmp.database().toString());
  var collectionOrderBy = xdmp.getRequestField('collOrder', 'frequency-order');
  var collectionOrderDirection = xdmp.getRequestField('collDir', 'descending');
  var batchOrderBy = xdmp.getRequestField('batchOrder', 'frequency-order');
  var batchOrderDirection = xdmp.getRequestField('batchDir', 'descending');

  xdmp.addResponseHeader('Content-Type', 'application/json; charset=utf-8');
  stats.database(id,
    {orderBy: collectionOrderBy, direction: collectionOrderDirection},
    {orderBy: batchOrderBy, direction: batchOrderDirection},
    {orderBy: 'count', direction: 'descending'}
  );
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
