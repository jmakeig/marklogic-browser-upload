'use strict'
var util = require('util.sjs');

// Object.assign polyfill
Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:function(e){"use strict";if(void 0===e||null===e)throw new TypeError("Cannot convert first argument to object");for(var r=Object(e),t=1;t<arguments.length;t++){var n=arguments[t];if(void 0!==n&&null!==n){n=Object(n);for(var o=Object.keys(n),a=0,i=o.length;i>a;a++){var c=o[a],b=Object.getOwnPropertyDescriptor(n,c);void 0!==b&&b.enumerable&&(r[c]=n[c])}}}return r}});

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

function databaseStats(id, collectionSort, batchSort, formatSort) {
  var estimate = util.applyAs(cts.estimate, {database: id});
  var collections = util.applyAs(getCollections, {database: id});

  var db = {};
  db.id = id;
  db.name = xdmp.databaseName(id);
  db.documentsCount = estimate(cts.trueQuery(), 'document');
  db.propertiesCount = estimate(cts.trueQuery(), 'properties');
  try {
    db.collections =
      collections(/^(?!batch-)/, collectionSort.orderBy, collectionSort.direction)
        // FIXME: The abstraction leaks here. applyAs always returns a ValueIterator.
        .next().value
        .concat([{
          name: '(none)',
          count: cts.estimate(cts.notQuery(cts.collectionQuery(cts.collections())), 'document'),
          isNone: true
        }]);
    db.batches = collections(/^batch-/, batchSort.orderBy, batchSort.direction).next().value; // FIXME
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
    if('ascending' === formatSort.direction) {
      return a.count > b.count;
    }
    // descending
    return a.count < b.count;

  });
  return db;
}

module.exports.database = databaseStats;
