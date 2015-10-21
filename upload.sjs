declareUpdate();

var files = xdmp.getRequestField('file'); // Array<Node>
var fileNames = xdmp.getRequestFieldFilename('file').toArray(); // Array<string>

for(var i = 0; i < files.length; i++) {
  xdmp.documentInsert(fileNames[i], xdmp.unquote(files[i]), xdmp.defaultPermissions(), xdmp.defaultCollections());
}

xdmp.setResponseCode(200, 'OK');
