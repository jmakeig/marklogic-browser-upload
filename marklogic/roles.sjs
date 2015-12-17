'use strict'

/**
 * Return a function proxy to invoke a function in another context.
 * The proxy can be called just like the original function, with the
 * same arguments and return types. Example uses: to run the input
 * as another user, against another database, or in a separate
 * transaction.
 *
 * @param fct {Function}   The function to invoke
 * @param options {Object} The `xdmp.eval` options.
 *                         Use `options.user` as a shortcut to
 *                         specify a user name (versus an ID)
 * @return {Function} A function that accepts the same arguments as
 *                    the originally input function. For example,
 *                    `applyAs(f)(1, 2)`
 */
function applyAs(fct, options) {
  return function() {
    var params = Array.prototype.slice.call(arguments);
    // Curry the function to include the params by closure.
    // xdmp.invokeFunction requires that invoked functions have
    // an arity of zero.
    var f = (function() {
       return fct.apply(null, params);
    }).bind(this);
    // Allow passing in user name, rather than id
    if(options.user) { options.userId = xdmp.user(options.user); delete options.user; }
    // Allow the functions themselves to declare their transaction mode
    if(fct.transactionMode && !(options.transactionMode)) { options.transactionMode = fct.transactionMode; }
    return xdmp.invokeFunction(f, options); // xdmp.invokeFunction returns a ValueIterator
  }
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
  var getRoleIds = applyAs(sec.getRoleIds, db);
  var getRoleNames = applyAs(sec.getRoleNames, db);

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

if('GET' === xdmp.getRequestMethod()) {
  var roleInputs = xdmp.getRequestField('role', '*');
  xdmp.addResponseHeader('Content-Type', 'application/json; charset=utf-8');
  getRoles(roleInputs); // UGLY having to pass in a wildcard string
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
