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

  collectionSort = collectionSort || { orderBy: 'frequency-order', direction: 'descending' };
  batchSort = batchSort || { orderBy: 'frequency-order', direction: 'descending' };
  formatSort = formatSort || { orderBy: 'frequency-order', direction: 'descending' };

  var db = {};
  db.id = id || xdmp.database();
  db.name = xdmp.databaseName(db.id);
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
  })
  // .sort(function(a, b) {
  //   if('ascending' === formatSort.direction) {
  //     return a.count > b.count;
  //   }
  //   // descending
  //   return a.count < b.count;
  //
  // });
  return db;
}

/**
 * Gets an Array of id-name Objects. Requires privileged access to security.
 *
 * @param names {Array<string>} An optional Array of role IDs or wildcards
 *                              used to filter. Only leading or trailing
 *                              wildcards are supported, e.g. `'*-internal'`.
 * @return {Array<Object>} Role ID keys and role name values
 */
function getRoles(names) {
  var sec = require('/MarkLogic/security.xqy');
  var db = {database: xdmp.securityDatabase()};
  var getRoleIds = util.applyAs(sec.getRoleIds, db);
  var getRoleNames = util.applyAs(sec.getRoleNames, db);

  /**
   * Match a test string against a leading or trailing wildcard pattern.
   * Memoized so the regular expressions used to do the matching are
   * only created once per pattern.
   *
   * @param test string
   * @param pattern string
   * @return boolean Whether there's a match
   */
  var isMatchWildcard = (function() {
    // Cache RegExp by pattern
    var cache = {};
    return function(test, pattern) {
      pattern = pattern || '*';
      if(!(pattern in cache)) {
        var wildcard = /^\*|\*$/g;
        if(1 === (pattern.match(wildcard) || []).length) {
          cache[pattern] = new RegExp('^' + pattern.replace(wildcard, '.*') + '$');
        } else {
          cache[pattern] = new RegExp('^' + pattern + '$');
        }
      }
      return 1 === (test.match(cache[pattern]) || []).length;
    }
  })();

  var isWildcarded = 'undefined' === typeof name;
  if('string' === typeof names) { names = [names]; }
  // if(!Array.isArray(names)) {
  //   throw new TypeError('Expected a string or array of string role names or wildcards, but got ' + (typeof names) + '.');
  // }
  if(Array.isArray(names)) {
    isWildcarded = names.some(function(value) { return !!(value.match(/\*/)) });
  }

  var rolesItr;
  if(!isWildcarded) {
    rolesItr = getRoleIds(xdmp.arrayValues(names));
  } else {
    rolesItr = getRoleIds();
  }

  var roleNames = getRoleNames(rolesItr).toArray().map(function(el) { return el.textContent; });

  var roles = [];
  var i = 0;
  for(var role of rolesItr) {
    var r = {}
    if(!isWildcarded || (isWildcarded && names.some(function(value) { return isMatchWildcard(roleNames[i], value); }))) {
      r[role.textContent] = roleNames[i];
      roles.push(r);
    }
    i++;
  }
  return roles;
}

module.exports.database = databaseStats;
module.exports.roles = getRoles;
