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
  collections.push('batch-1234');
}
console.log(collectionsDefault);
if(collectionsDefault) {
  collections = collections.concat(xdmp.defaultCollections().toArray())
}
console.log(collections);

function getURI(node, policy, filename) {
  switch (policy) {
    case 'filename':
      return filename;
      break;
    case 'id':
      break;
    case 'uuid':
      break;
    default:
      throw new TypeError(policy + ' is not a valid URI policy');
  }
}


for(var i = 0; i < files.length; i++) {
  var node = xdmp.unquote(files[i]);
  xdmp.documentInsert(
    getURI(node, uris, fileNames[i]),
    node,
    xdmp.defaultPermissions(),
    collections
  );
}

xdmp.setResponseCode(200, 'OK');
