declareUpdate();

var util = require('./util.sjs');

// console.log(xdmp.getRequestFieldNames());

var files = xdmp.getRequestField('files'); // Array<Node>
var fileNames = xdmp.getRequestFieldFilename('files').toArray(); // Array<string>

var uris = xdmp.getRequestField('uris', 'filename');

var collectionBatch = xdmp.getRequestField('collection-batch');
var collectionsDefault = xdmp.getRequestField('collection-defaults');
var collections = xdmp.getRequestField('collections');
// TODO: Ugly
if('undefined' === typeof collections || null === collections) { collections = []; }
else if('string' === typeof collections) { collections = [collections]; }
if(collectionBatch) {
  collections.push('batch-' + util.uuid());
}
if(collectionsDefault) {
  collections = collections.concat(xdmp.defaultCollections().toArray())
}

/*
Permissions are conveyed from the browser as arrays of capabilities, keyed on
the string, `permission*`, concatenated with a role name,
e.g. `permission*rest-reader: ['read']`.
`*` is used as a delimiter becuase it's not a valid character in a role name.
 */
var permissions = xdmp.getRequestFieldNames()
  .toArray()
  .filter(function(f){
    //console.log(f);
    return f.match(/^permission\*/);
  })
  .map(function(f){
    var perm = {};
    perm[f.split('\*')[1]] = xdmp.getRequestField(f);
    return perm;
  });


/**
 * Map the data structure derived from the browser to proper `xdmp.permission`
 * instances.
 *
 * @param  {object} permissions `{role: [capability, capability]}`
 * @param  {boolean} defaults   Whether to include default permissions from
 *                              the current user
 * @return {Array<xdmp.permission>}
 */
function calculatePermissions(permissions, defaults) {
  var perms = [];
  permissions.forEach(function(role){
    for(r in role) {
      if(!Array.isArray(role[r])) { role[r] = [role[r]]; }
      perms = perms.concat(
        role[r].map(function(cap){
          //console.log(xdmp.permission(r, cap));
          return xdmp.permission(r, cap);
        })
      );
    }
  });
  if(defaults) {
    perms = perms.concat(xdmp.defaultPermissions());
  }
  return perms;
}



// FIXME: This is brittle
// TODO: What about XML namespaces? (Really, what people will want to do is type their own XPath. Sigh.)
function extractID(doc) {
  var id = doc.xpath('(//(id|_id))[1]').next().value;
  if(!id) { // Why doesn't comparison to null work here?
    throw new Error('The document does not contain an ID, either id or _id.\n' + doc);
  }
  if(id instanceof XMLNode) return id.textContent;
  return id;
}

/**
 * Derive a URI for identifying documents based on one of three policies:
 *   * filename: Uses the filename given by the client
 *   * id: Finds the first `id` or `_id` property in the document and uses its
 *     value
 *   * uuid: Generates a UUID
 * For `id` and `uuid` it appends a file extension based on the node kind,
 * one of `json`, `xml`, `text`, or `binary`.
 * All URIs are prepended with a `/` so that you can use things that require
 * directory scoping, like CPF
 * @param  {Node} node     The document
 * @param  {string} policy   One of `filename`, `id`, or `uuid`
 * @param  {string} filename The name of the file from the client file system
 * @return {string}          A fully formed URI based on the policy
 */
function deriveURI(node, policy, filename) {
  var basename = filename;
  // console.log(node);
  var kind = util.documentKind(node);
  switch (policy) {
    case 'filename':
      break;
    case 'id':
      basename = extractID(node) + '.' + kind;
      break;
    case 'uuid':
      basename = util.uuid() + '.' + kind;
      break;
    default:
      throw new TypeError(policy + ' is not a valid URI policy');
  }
  return '/' + basename;
}

var docCount = files.length;
for(var i = 0; i < docCount; i++) {
  var node = xdmp.unquote(files[i]).next().value; // Yikes! unquote always returns a ValueIterator.
  var uri = deriveURI(node, uris, fileNames[i]);
  console.log('Inserting ' + uri);
  xdmp.documentInsert(
    uri,
    node,
    calculatePermissions(permissions, xdmp.getRequestField('permission-defaults')),
    collections
  );
}

xdmp.setResponseCode(200, 'OK');
xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');

var response =
  {
    count: docCount,
    collections: collections
  };
response;
