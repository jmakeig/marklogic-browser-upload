import {button, div, h1, h2, h3, p, span, td, tr} from '../dom.js';

/**
 * Render database stats.
 * @param  {HTMLElement} el The parent element under which to render.
 *                          This element will be cloned, so none of
 *                          its event handlers will remain.
 * @param  {Object} db The database stats state
 * @return undefined  This function has side-effects.
 */
export function renderDatabaseStats(el, db) {
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
					button('Clear', undefined, {name: 'collection-clear', value: (coll.isNone ? '********none' : coll.name)}),
					'button'
				));
      table.appendChild(row);
    });
  }
  section.appendChild(table);

  section.appendChild(h3('Batches'));
  if(Array.isArray(db.batches) && db.batches.length > 0) {
		var table = document.createElement('table');
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
		section.appendChild(table);
  } else {
		section.appendChild(div('none'));
	}

  parent.replaceChild(section, el);
}