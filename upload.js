document.querySelector('#fileselect')
  .addEventListener('change', FileSelectHandler, false);


function FileSelectHandler(e) {

  // fetch FileList object
  var files = e.target.files;

  var data = new FormData();

  // process all File objects
  for (var i = 0, f; f = files[i]; i++) {
    data.append('file', f);
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload.sjs');
  xhr.onload = function() {
    console.log("Done");
  };

  xhr.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      var complete = (event.loaded / event.total * 100 | 0);
      console.log('Progress %d', complete);
    }
  }

  xhr.send(data);
}
