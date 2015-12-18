declareUpdate();

var util = require('util.sjs');

console.log(xdmp.getRequestFieldNames());

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

// console.log(
//   xdmp.getRequestFieldNames()
//     .toArray()
//     .filter(function(f){
//       console.log(f);
//       return f.match(/^permission\*/);
//     })
//     .map(function(f){
//       var perm = {};
//       perm[f.split('\*')[1]] = xdmp.getRequestField(f);
//       return perm;
//     })
//   );

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

for(var i = 0; i < files.length; i++) {
  var node = xdmp.unquote(files[i]).next().value; // Yikes! uquote always returns a ValueIterator.
  xdmp.documentInsert(
    deriveURI(node, uris, fileNames[i]),
    node,
    calculatePermissions(permissions, xdmp.getRequestField('permission-defaults')),
    collections
  );
}

xdmp.setResponseCode(200, 'OK');
xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
collections;
