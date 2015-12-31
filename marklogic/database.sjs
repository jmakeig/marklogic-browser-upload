'use strict'
var util = require('util.sjs');

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
      return filter && (coll + '').match(filter); // Need to coerce the Value to a string
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
  var id = xdmp.getRequestField('id', xdmp.database().toString());
  var collectionOrderBy = xdmp.getRequestField('collOrder', 'frequency-order');
  var collectionOrderDirection = xdmp.getRequestField('collDir', 'descending');
  var batchOrderBy = xdmp.getRequestField('batchOrder', 'frequency-order');
  var batchOrderDirection = xdmp.getRequestField('batchDir', 'descending');

  var estimate = util.applyAs(cts.estimate, {database: id});
  var getCollections = util.applyAs(getCollections, {database: id});

  var db = {};
  db.id = id;
  db.name = xdmp.databaseName(id);
  db.documentsCount = estimate(cts.trueQuery(), 'document');
  db.propertiesCount = estimate(cts.trueQuery(), 'properties');
  try {
    db.collections =
      getCollections(/^(?!batch-)/, collectionOrderBy, collectionOrderDirection)
        // FIXME: The abstraction leaks here. applyAs always returns a ValueIterator.
        .next().value
        .concat([{
          name: '(none)',
          count: cts.estimate(cts.notQuery(cts.collectionQuery(cts.collections())), 'document'),
          isNone: true
        }]);
    db.batches = getCollections(/^batch-/, batchOrderBy, batchOrderDirection);
  } catch(ex) {
    if('XDMP-COLLXCNNOTFOUND' === ex.name) {
      db.collections = db.batches = null;
    } else {
      throw ex;
    }
  }
  // Counts of documents by format,  [{'format': 'xml', 'count': 1234}, …]
  db.documentFormats = ['json', 'xml', 'binary', 'text'].map(function(format) {
    return {
      format: format,
      count: cts.estimate(cts.trueQuery(), ['format-' + format, 'document'])
    }
  }).sort(function(a, b) {
    return a.count < b.count;
  });

  xdmp.addResponseHeader('Content-Type', 'application/json; charset=utf-8');
  db;
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
