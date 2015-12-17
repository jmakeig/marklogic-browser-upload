'use strict'

/**
 * Get names and document counts of collections filtered by `filter`.
 * @param  {RegEx} filter      A regular expression to filter the collection names
 * @param  {string} order      `item-order` or `frequency-order` (default)
 * @param  {string} direction  `ascending` or `descending` (default)
 * @return {Array}             `{ name: string, count: number}` pairs
 */
function getCollections(filter, order, direction) {
  return cts.values(
    cts.collectionReference(), null, [order || 'frequency-order', direction || 'descending', 'document']
  )
    .toArray()
    .filter(function(coll) {
      return filter && (coll + '').match(filter);
    })
    .map(function(coll) {
      return {
        name: coll,
        count: cts.frequency(coll)
      }
    });
}

if('GET' === xdmp.getRequestMethod()) {
  /**
    GET database stats:
      - Name
      - Documents count
      - Properties count
      - For each user collection: Name and document count, ordered by count (default) or name, ascending or descending (default)
      - Same for system (batch) collections
  */
  var collectionOrderBy = xdmp.getRequestField('collOrder', 'frequency-order');
  var collectionOrderDirection = xdmp.getRequestField('collDir', 'descending');
  var batchOrderBy = xdmp.getRequestField('batchOrder', 'frequency-order');
  var batchOrderDirection = xdmp.getRequestField('batchDir', 'descending');

  var db = {}
  db.id = xdmp.database();
  db.name = xdmp.databaseName(xdmp.database());
  db.documentsCount = cts.estimate(cts.andQuery([]), 'document');
  db.propertiesCount = cts.estimate(cts.andQuery([]), 'properties');
  db.collections = getCollections(/^(?!batch-)/, collectionOrderBy, collectionOrderDirection);
  db.batches = getCollections(/^batch-/, batchOrderBy, batchOrderDirection);

  xdmp.addResponseHeader('Content-Type', 'application/json; charset=utf-8');
  db;
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
