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
  if('function' !== typeof fct) { throw new ReferenceError('Function must be defined'); }
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

function uuid() {
  return sem.uuid().toString().split(':')[2];
}

module.exports.applyAs = applyAs;
module.exports.uuid = uuid;
