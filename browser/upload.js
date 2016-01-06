// Object.assign polyfill
Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:function(e){"use strict";if(void 0===e||null===e)throw new TypeError("Cannot convert first argument to object");for(var r=Object(e),t=1;t<arguments.length;t++){var n=arguments[t];if(void 0!==n&&null!==n){n=Object(n);for(var o=Object.keys(n),a=0,i=o.length;i>a;a++){var c=o[a],b=Object.getOwnPropertyDescriptor(n,c);void 0!==b&&b.enumerable&&(r[c]=n[c])}}}return r}});


(function() {

function dragHover(e) {
  //e.stopPropagation();
	e.preventDefault();
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

function sendFiles(files) {
  var data = new FormData(document.getElementById('upload'));

  var progress = document.getElementById('progress');

  // process all File objects
  for (var i = 0, f; f = files[i]; i++) {
    //console.log('Adding file %s', f);
    console.dir(f);
    data.append('files', f);
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/marklogic/upload.sjs');
  xhr.onload = function() {
    console.dir(JSON.parse(xhr.responseText));
    // FIXME: Change this to a Promise
    updateDatabaseStats(document.querySelector('#database'));
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

/**
 *
 * @param  {[type]} handler [description]
 * @return {Promise}         [description]
 */
function getDatabaseStats(handler) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/marklogic/endpoints/database.sjs');
    xhr.onload = function() {
      // TODO: Check status code and reject accordingly
      resolve(JSON.parse(xhr.responseText));
    };
    xhr.onerror = function() {
      reject(Error("Network Error"));
    };
    xhr.send();
  });
}

function renderDatabaseStats(el, db) {
  /*
  <h2>Documents</h2>
  <div>114,328 documents</div>
  <div>1,187 properties</div>
  <h3>Collections</h3>
  <table>
    <tr><td>staging</td><td class="number">89,995</td><td class="button"><button name="collection-staging-clear" value="clear">Clear…</button></td></tr>
    <tr><td>production</td><td class="number">24,333</td><td class="button"><button name="collection-production-clear" value="clear">Clear…</button></td></tr>
    <tr><td>batch-123</td><td class="number">100</td><td class="button"><button name="collection-batch-123-clear" value="clear">Clear…</button></td></tr>
    <tr><td>batch-456</td><td class="number">87</td><td class="button"><button name="collection-batch-456-clear" value="clear">Clear…</button></td></tr>
  </table>
  <h3>Formats</h3>
  <table>
    <tr><td>json</td><td class="number">89,995</td></tr>
    <tr><td>xml</td><td class="number">24,333</td></tr>
    <tr><td>binary</td><td class="number">100</td></tr>
    <tr><td>text</td><td class="number">87</td></tr>
  </table>
  */

  function _el(localname, classList, attrs, contents) {
    var elem = document.createElement(localname || 'div');
		if('string' === typeof contents) {
    	elem.textContent = contents;
		} else if('number' === typeof contents) {
			elem.textContent = contents.toString();
		}
		else if(contents instanceof HTMLElement) {
			elem.appendChild(contents);
		}
		else if((Array.isArray(contents) && contents[0] instanceof HTMLElement) || contents instanceof NodeList) {
			// https://developer.mozilla.org/en-US/docs/Web/API/NodeList
			Array.prototype.forEach.call(contents, function(item){
				elem.appendChild(item);
			});
		}
    if(classList) {
			if('string' === typeof classList) { classList = [classList]; }
      classList.forEach(function(cls){
        elem.classList.add(cls);
      });
    }
    if(attrs) {
      for(key in attrs) {
        elem.setAttribute(key, attrs[key]);
      }
    }
    return elem;
  }
  function div   (t)       { return _el('div',    undefined, undefined, t);}
  function h2    (t)       { return _el('h2',     undefined, undefined, t);}
  function h3    (t)       { return _el('h3',     undefined, undefined, t);}
  function td    (t, c, a) { return _el('td',     c, a, t);}
	function button(t, c, a) { return _el('button', c, a, t);}

  console.log(db);
  var parent = el.parentNode;

  var section = el.cloneNode(false);
  section.appendChild(h2(db.name));
  section.appendChild(div(db.documentsCount + ' documents'));
  section.appendChild(div(db.propertiesCount + ' properties'));

  section.appendChild(h3('Document Formats'));
  var table = document.createElement('table');
  db.documentFormats.forEach(function(coll){
    var row = document.createElement('tr');
      row.appendChild(td(coll.format));
      row.appendChild(td(coll.count, ['number']));
			row.appendChild(td(
				button('Clear', undefined, {name: 'format-clear', value: coll.format}),
				'button'
			));
    table.appendChild(row);
  });
  section.appendChild(table);

  section.appendChild(h3('Collections'));
  var table = document.createElement('table');
  if(Array.isArray(db.collections)) {
    db.collections.forEach(function(coll){
      var row = document.createElement('tr');
        row.appendChild(td(coll.name));
        row.appendChild(td(coll.count, ['number']));
				row.appendChild(td(
					button('Clear', undefined, {name: 'collection-clear', value: coll.name}),
					'button'
				));
      table.appendChild(row);
    });
  }
  section.appendChild(table);

  section.appendChild(h3('Batches'));
  var table = document.createElement('table');
  if(Array.isArray(db.batches)) {
    db.batches.forEach(function(coll){
      var row = document.createElement('tr');
        row.appendChild(td(coll.name));
        row.appendChild(td(coll.count, ['number']));
				row.appendChild(td(
					button('Clear', undefined, {name: 'collection-clear', value: coll.name}),
					'button'
				));
      table.appendChild(row);
    });
  }
  section.appendChild(table);

  parent.replaceChild(section, el);
}


// function logEvent(evt){
//   console.log('%s: %s', evt.type, evt.bubbles ? 'bubbles' : 'doesn’t bubble');
//   //console.dir(evt);
// }

// ['click', 'change', 'dragover', 'dragleave', 'drop'].forEach(function(evt){
//   document.addEventListener(evt, logEvent);
// });

document.querySelector('#fileselect')
  .addEventListener('change', fileSelectHandler, false);

document.querySelector('#filedrag')
  .addEventListener('drop', dropHandler);

document.querySelector('#filedrag')
  .addEventListener('dragover', dragHover, false);
document.querySelector('#filedrag')
  .addEventListener('dragleave', dragHover, false);

function updateDatabaseStats(el) {
  getDatabaseStats()
    .then(function(stats){
      renderDatabaseStats(el, stats);
    })
    .catch(function(err){
      console.error(err);
    });
}
updateDatabaseStats(document.querySelector('#database'));

})();
