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
  try {
    var collRef = cts.collectionReference();
  } catch(e) {
    return [];
  }
  return cts.values(
    collRef, null, [order || 'frequency-order', direction || 'descending', 'document']
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

function getDatabaseStats(collections, batches) {
  var id = xdmp.database();
  var defaultSort = {orderBy: 'frequency-order', direction: 'descending'};
  collections = Object.assign(defaultSort, collections);
  batches = Object.assign(defaultSort, batches);

  //var estimate = util.applyAs(cts.estimate, {database: id});
  //var getCollections = util.applyAs(getCollections, {database: id});

  var db = {}
  db.id = id;
  db.name = xdmp.databaseName(id);
  db.documentsCount = cts.estimate(cts.andQuery([]), 'document');
  db.propertiesCount = cts.estimate(cts.andQuery([]), 'properties');
  db.collections = getCollections(/^(?!batch-)/, collections.orderBy, collections.direction);
  db.batches = getCollections(/^batch-/, batches.orderBy, batches.direction);
  return db;
}

module.exports.getDatabaseStats = getDatabaseStats;
