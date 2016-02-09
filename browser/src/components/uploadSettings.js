'use strict'
import {button, checkbox, div, h1, h2, h3, p, span, td, tr, input, select} from '../util/dom.js';
import * as dom from '../util/dom.js';

export function bindRenderUploadSettings(bindings) {
  /*
  {
		'uris': Array.from(document.querySelectorAll('input[name=uris]')),
		'collections': {
			'list': document.querySelector('table.collections > tbody'), // table
			'defaults': document.querySelector('input[name=collection-defaults]'),
			'batch': document.querySelector('input[name=collection-batch]')
		},
		'permissions': {
			'list': document.querySelector('table.permissions > tbody'), // table
			'defaults': document.querySelector('input[name=permission-defaults]')
		}
	}
  */
  return function(options, locale) {
    /*
    <section>
      <h2>Settings</h2>
      <div>
        <h3>URIs</h3>
        <ul class="select-group">
          <li><label title="Use the each file’s filename as its database URI."><input type="radio" name="uris" value="filename" checked="checked"/>Filename</label></li>
          <li><label title="Use the root-level id or _id property (JSON) or element (XML) as the database URI."><input type="radio" name="uris" value="id"/><code>_id</code> or <code>id</code></label></li>
          <li><label title="Generate a cryptographically unique identifier for each document."><input type="radio" name="uris" value="uuid"/>UUID</label></li>
        </ul>
        <h3>Collections</h3>
        <div>
          <table class="collections">
            <tr><td>staging</td><td class="check"><input type="checkbox" name="collections" value="staging" checked="checked"/></td></tr>
            <tr><td>production</td><td class="check"><input type="checkbox" name="collections" value="production" checked="checked"/></td></tr>
          </table>
          <div></div>
          <ul class="select-group">
            <li><button name="collection-add">+ Add</button></li>
            <li><label title="Also include a collection name unique to this upload in the from 'batch-1234'. This is useful for quickly rolling back an upload."><input type="checkbox" name="collection-batch" value="true" checked="checked"/>Batch</label></li>
            <li><label title="Also inlcude the default collections as configured for your security role by the database administrator."><input type="checkbox" name="collection-defaults" value="true" checked="checked"/>Defaults</label></li>
          </ul>
        </div>
        <div>
          <table class="permissions">
            <colgroup span="1"/>
            <colgroup span="4"/>
            <thead><tr><th><h3>Permissions</h3></th><th>R</th><th>U</th><th>I</th><th>E</th></tr></thead>
            <tbody>
              <tr><td>rest-reader</td>
                <td class="check"><input type="checkbox" name="permission*rest-reader" value="read" checked="checked"/></td>
                <td class="check"><input type="checkbox" name="permission*rest-reader" value="update"/></td>
                <td class="check"><input type="checkbox" name="permission*rest-reader" value="insert"/></td>
                <td class="check"><input type="checkbox" name="permission*rest-reader" value="execute"/></td>
              </tr>
              <tr><td>rest-writer</td>
                <td class="check"><input type="checkbox" name="permission*rest-writer" value="read" checked="checked"/></td>
                <td class="check"><input type="checkbox" name="permission*rest-writer" value="update" checked="checked"/></td>
                <td class="check"><input type="checkbox" name="permission*rest-writer" value="insert" checked="checked"/></td>
                <td class="check"><input type="checkbox" name="permission*rest-writer" value="execute"/></td>
              </tr>
            </tbody>
          <table>
          <ul class="select-group">
            <li><button name="permission-add">+ Add</button></li>
            <li><label><input type="checkbox" name="permission-defaults" value="true" checked="checked"/>Defaults<label></li>
          </ul>
        </div>
      </div>
    </section>
     */

    bindings.uris.forEach(uri => uri.checked = (uri.value === options.uri));

    const collections = dom.clear(bindings.collections.list);
    options.collections.user
      .map(coll => tr([
        //td(coll.name),
        td(
          input(coll.name, undefined, { name: 'collection*' + coll.name })
        ),
        td(
          checkbox(coll.enabled, undefined, {name: 'collections', value: coll.name}),
          'check'
        ),
        td(
          button('×', 'remove',
            {name: 'collection-remove', value: coll.name, title: `Remove collection, ${coll.name}, from the upload settings` }
          ),
          ['action']
        )
      ])
      )
      .forEach(row => collections.appendChild(row));

    /*
      permissions: {
  			user: {
  				'some-role': ['read', 'update', 'insert', 'execute']
  			},
  			'default': true,
  			cachedRoles: null // Pre-load the roles from the server for auto-suggest
  		}
    */
    const permissions = dom.clear(bindings.permissions.list);
    const capabilities = ['read', 'update', 'insert', 'execute'];

    /*
    function makeKeyValue(obj) {
      if(obj) {
        const out = {};
        for(let k in obj) {
          if(out[obj[k]]) { throw new Error(`Key ${obj[k]} already exists`); }
          out[obj[k]] = obj[k];
        }
        return out;
      }
    }
    */

    // FIXME: Yuck! This is
    function firstValue(obj) { if(!obj) return; for(let k in obj) return obj[k]; }

    function buildRolesSelect(name, selectedValue) {
      let opts = [];
      if(options && options.permissions && options.permissions.cachedRoles) {
        opts = options.permissions.cachedRoles
          .sort((a, b) => firstValue(a) > firstValue(b) ? 1 : -1);
      }
      return select(
        opts,
        null,
        Object.assign({},
          name ? {name: name} : {},
          selectedValue ? {value: selectedValue} : {}
        )
      );
    }

    Object.keys(options.permissions.user)
      .map(role => tr([
        td(buildRolesSelect(role, role)),
        ...capabilities.map(
          cap => td(
            checkbox(
              options.permissions.user[role].indexOf(cap) > -1,
              undefined,
              {
                name: 'permission*' + role, value: cap,
                title: cap // TODO: l12n and capitalization
              }
            )
            , 'check'
          )
        ),
        td(
          button('×', 'remove',
            {name: 'permission-remove', value: role, title: `Remove permissions for ${role}`}
          ),
          ['action']
        )
      ])
      )
      .forEach(row => permissions.appendChild(row));

    bindings.permissions.defaults.checked = options.permissions.default;
  }
}
