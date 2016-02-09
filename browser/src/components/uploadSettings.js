'use strict'
import {button, checkbox, div, h1, h2, h3, p, span, td, tr, input, select} from '../util/dom.js';
import * as dom from '../util/dom.js';
import * as util from '../util/util.js';

/**
 * Returns a function that can render the upload settings.
 * It passes in the DOM bindings via a closure, such that
 * callers can use it without knowing (or caring) about how
 * it’s actually connected to the DOM.
 *
 * @param  {object} bindings A nested structure whose values are
 *                           `HTMLElement` or ``[HTMLElement]`` instances
 * @return {function(options, locale)}
 */
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

    function buildRolesSelect(name, selectedValue) {
      let opts = [];
      if(options && options.permissions && options.permissions.cachedRoles) {
        opts = options.permissions.cachedRoles
          .sort((a, b) => util.firstValue(a) > util.firstValue(b) ? 1 : -1);
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
