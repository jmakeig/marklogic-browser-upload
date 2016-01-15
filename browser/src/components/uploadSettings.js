'use strict'

export function bindRenderUploadSettings(bindings) {
  bindings = {
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
    bindings.uris.forEach(function(uri) {
      if(uri.value === options.uri) { uri.checked = true; } else { uri.checked = false; }
    });
  }
}
