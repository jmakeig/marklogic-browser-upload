// Object.assign polyfill
Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:function(e){"use strict";if(void 0===e||null===e)throw new TypeError("Cannot convert first argument to object");for(var r=Object(e),t=1;t<arguments.length;t++){var n=arguments[t];if(void 0!==n&&null!==n){n=Object(n);for(var o=Object.keys(n),a=0,i=o.length;i>a;a++){var c=o[a],b=Object.getOwnPropertyDescriptor(n,c);void 0!==b&&b.enumerable&&(r[c]=n[c])}}}return r}});


(function() {
document.querySelector('#fileselect')
  .addEventListener('change', fileSelectHandler, false);

document.querySelector('#filedrag')
  .addEventListener('drop', dropHandler);

document.querySelector('#filedrag')
  .addEventListener("dragover", dragHover, false);
document.querySelector('#filedrag')
  .addEventListener("dragleave", dragHover, false);

function dragHover(e) {
  e.stopPropagation();
	e.preventDefault();
}

/*
var EventEmitter = {
  on: function(name, handler) {
    if(!this.events) { this.events = {}; }
    if(!Array.isArray(this.events[name])) { this.events[name] = []; }
    this.events[name].push(handler);
  },
  emit: function(name, data) {
    if('string' !== typeof(name) || name.length < 1) throw new TypeError('Name must be a string');
    if(!this.events || !Array.isArray(this.events[name]) || this.events[name].length < 1) return;

    var data = Array.prototype.slice.call(arguments, 1);
    for(var i = 0; i < this.events[name].length; i++) {
      var handler = this.events[name][i];
      handler.apply(null, data);
    }
  }
}

var FileUploader = {
    init: function(id) { return this; }
}
Object.assign(FileUploader, EventEmitter);

var fu = Object.create(FileUploader).init();
*/


function sendFiles(files) {
  var data = new FormData(document.getElementById('upload'));

  var progress = document.getElementById('progress');

  // process all File objects
  for (var i = 0, f; f = files[i]; i++) {
    data.append('files', f);
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/marklogic/upload.sjs');
  xhr.onload = function() {
    console.log("Done");
    console.dir(JSON.parse(xhr.responseText));
  };

  xhr.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      var complete = event.loaded / event.total;
      progress.value = complete;
      //console.log('Progress %d', complete * 100);
      //console.dir(complete);
    }
  }

  xhr.send(data);
}

function dropHandler(e) {
  // console.dir(e.target);
  // console.dir(this);
  if(this === e.target) {
    sendFiles(e.dataTransfer.files);
  }
}

function fileSelectHandler(e) {
  var files = e.target.files; // FileList
  sendFiles(files);
}

function progressHandler() {}

})();
