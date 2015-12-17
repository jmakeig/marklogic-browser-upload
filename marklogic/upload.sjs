declareUpdate();

var util = require('util.sjs');

console.log(xdmp.getRequestFieldNames());

var files = xdmp.getRequestField('files'); // Array<Node>
var fileNames = xdmp.getRequestFieldFilename('files').toArray(); // Array<string>

var uris = xdmp.getRequestField('uris', 'filename');

var collectionBatch = xdmp.getRequestField('collection-batch');
var collectionsDefault = xdmp.getRequestField('collection-defaults');
var collections = (xdmp.getRequestField('collections') || []);
if(collectionBatch) {
  collections.push('batch-' + util.uuid());
}
if(collectionsDefault) {
  collections = collections.concat(xdmp.defaultCollections().toArray())
}

function deriveURI(node, policy, filename) {
  var basename = filename;
  switch (policy) {
    case 'filename':
      break;
    case 'id':
      throw new TypeError('id policy is not yet implemented');
      break;
    case 'uuid':
      basename = util.uuid() + '.json';
      break;
    default:
      throw new TypeError(policy + ' is not a valid URI policy');
  }
  return '/' + basename;
}

function findID(node) {
  // TODO: Get the id or _id property out of JSON or the corresponding elements out of XML
}

for(var i = 0; i < files.length; i++) {
  var node = xdmp.unquote(files[i]);
  xdmp.documentInsert(
    deriveURI(node, uris, fileNames[i]),
    node,
    xdmp.defaultPermissions(),
    collections
  );
}

xdmp.setResponseCode(200, 'OK');
xdmp.addResponseHeader('Content-Type', 'application/json;charset=utf-8');
collections;
