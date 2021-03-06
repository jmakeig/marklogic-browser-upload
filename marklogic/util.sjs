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

// TODO: Isn't there a built-in that does this? Yes: <http://docs.marklogic.com/Document.documentFormat>
function documentKind(node) {
  switch(xdmp.nodeKind(node)) {
    case "document":
      return documentKind(node.root);
    case "element":
    case "comment":
    case "processing-instruction":
      return "xml";
    case "object":
    case "array":
    case "number":
    case "boolean":
    case "null":
      return "json";
    case "text":
      return "text";
    case "binary":
      return "binary";
    default:
      throw new TypeError(xdmp.nodeKind(node) + ' is not a recognized node kind');
  }
}

function head(itr) {
  if('function' === typeof itr.next) {
    return itr.next().value;
  } else if('function' === typeof itr[Symbol.iterator]) {
    // FIXME: Update to fn.head when available.
    return itr[Symbol.iterator]().next().value;
  }
  throw new TypeError(Object.prototype.toString().call(itr) + ' is not an Iterable or a ValueIterator');
}

// TODO: Ugly!
if(!Array.from) {
  Array.from = function(itr) {
    if(!itr) throw new TypeError('Cannot create an array from a missing value');
    if(itr instanceof ValueIterator) return itr.toArray();
    var out = [];
    if('function' === typeof itr.next) {
      for(var item of itr) {
        out.push(item);
      }
      return out;
    }
    throw new TypeError('Not iterable');
  }
}

module.exports.applyAs = applyAs;
module.exports.uuid = uuid;
module.exports.documentKind = documentKind;
