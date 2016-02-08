'use strict'

// import 'number-to-locale-string';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import {
	refreshDatabaseStats,
	clearDatabase,
	clearFormat,
	clearCollection,
	changeURIPolicy,
	changePermission,
	addPermission,
	changePermissionDefaults,
	addCollection,
	changeCollectionEnabled,
	changeCollectionDefaults,
	changeCollectionBatch,
	specifiedFiles,
	uploadFiles,
	getRoles
} from './actions';
import {reducer} from './reducers';
import {bindRenderDatabaseStats} from './components/databaseStats';
import {bindRenderUploadSettings} from './components/uploadSettings';


const PERMISSION_NAMESPACE = 'permission*';

// function escapeCSS(str) {
// 	return str.replace(/(\*:)/g, (match, $1, offset, original) => '\\$1');
// }
function changeHandler(evt){
	console.info('%s ➞ %s', evt.type, evt.target.name);
	let target = evt.target;
	switch (target.name) {
		case 'uris':
			store.dispatch(changeURIPolicy(target.value));
			break;
		case 'collections':
			store.dispatch(changeCollectionEnabled(target.value, target.checked));
			break;
		case 'collection-defaults':
			store.dispatch(changeCollectionDefaults(target.checked));
			break;
		case 'permission-defaults':
			store.dispatch(changePermissionDefaults(target.checked));
			break;
		case 'collection-batch':
			store.dispatch(changeCollectionBatch(target.checked));
			break;
		default:
			if(target.name.startsWith(PERMISSION_NAMESPACE)) {
				let role = target.name.slice(PERMISSION_NAMESPACE.length);
				let capabilities = Array.from(
						document.querySelectorAll('input[name=' + 'permission\\*' + role + ']') // Double escape: first for JavaScript then for CSS
					)
					.filter(el => el.checked)
					.map(el => el.value);
				// console.dir(permissions);
				store.dispatch(changePermission(role, capabilities));
			}
	}
}
document.querySelector('form').addEventListener('change', changeHandler, true);
function submitHandler(evt) {
	// TODO: The issue is that buttons automatically submit the form. Should
	// the preventDefault be in the button logic or the form?
	console.info('Captured submit event');
	evt.preventDefault();
}
document.querySelector('form').addEventListener('submit', submitHandler, true);

function clickHandler(evt) {
	console.info('%s ➞ %s', evt.type, evt.target.name);
	const target = evt.target;
	switch(target.nodeName.toLowerCase()) {
		case 'button':
			switch (target.name) {
				case 'database-clear':
					store.dispatch(clearDatabase(store.getState().get('databaseID')));
					break;
				case 'collection-clear':
					store.dispatch(clearCollection(target.value));
					break;
				case 'format-clear':
					store.dispatch(clearFormat(target.value));
					break;
				case 'collection-add':
					store.dispatch(addCollection());
					break;
				case 'permission-add':
					store.dispatch(addPermission());
					break;
				default:

			}
			break;
		default:

	}
}
document.querySelector('form').addEventListener('click', clickHandler, true);

const store = applyMiddleware(thunk)
	(createStore) // middleware store creator
		(reducer); // create the store



const renderDatabaseStats = bindRenderDatabaseStats(document.querySelector('#database'));
const renderUploadSettings = bindRenderUploadSettings(
	{
		'uris': Array.from(document.querySelectorAll('input[name=uris]')),
		'collections': {
			'list': document.querySelector('table.collections > tbody'),
			'defaults': document.querySelector('input[name=collection-defaults]'),
			'batch': document.querySelector('input[name=collection-batch]')
		},
		'permissions': {
			'list': document.querySelector('table.permissions > tbody'),
			'defaults': document.querySelector('input[name=permission-defaults]')
		}
	}
);

function dropHandler(evt) {
	evt.preventDefault();
	evt.stopPropagation();
  // console.dir(evt.target);
  if(this === evt.target) {
    const files = evt.dataTransfer.files;
    store.dispatch(specifiedFiles(files));
		const data = new FormData(document.getElementById('upload'));
	  for (let i = 0, f; f = files[i]; i++) {
	    console.log('Adding file %s', f);
	    data.append('files', f);
	  }
		store.dispatch(uploadFiles(data));
  }
}
document.querySelector('#filedrag').addEventListener('drop', dropHandler);

function dragHover(evt) {
  evt.stopPropagation();
	evt.preventDefault();
}
document.querySelector('#filedrag').addEventListener('dragover', dragHover, false);
document.querySelector('#filedrag').addEventListener('dragleave', dragHover, false);

function observeStore(store, select, onChange) {
  let currentState;
  function handleChange() {
    let nextState = select(store.getState());
    if (nextState !== currentState) {
			onChange(currentState, nextState);
			currentState = nextState;
    }
  }
  let unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
}

observeStore(store, x => x, (curr, next) => {
	// if(undefined !== curr) {
	// 	console.log('Previous: %s, Next: %s', curr.toJS().uploadSettings.uri, next.toJS().uploadSettings.uri);
	// }

	const state =
		Object.freeze( // TODO: Object.freeze is probably overkill.
			next.toJS()
		);
	console.dir(state);
	if(state.databaseStats) {
		renderDatabaseStats(state.databaseStats);
	}
	if(state.uploadSettings) {
		renderUploadSettings(state.uploadSettings);
	}

	if(state.files.uploadProgress) {
		document.querySelector('progress#progress').value = state.files.uploadProgress;
	}

	// TODO: Show work indicator
	if(Object.keys(state.workInProgress).length > 0) {
		console.info('%d in progress', Object.keys(state.workInProgress).length);
	} else {
		console.info('None in progress');
	}
});

/*
store.subscribe(() => {
	// TODO: Should I encapsulate Immutable? It feels like the view layer
	// should only know about implicitly immutable JavaScript objects,
	// not the actaul Immutable.js interfaces. How expensive is the
	// `.toJS()` method?
	const state =
		Object.freeze( // TODO: Object.freeze is probably overkill.
			store.getState().toJS()
		);
	console.dir(state);
	if(state.databaseStats) {
		renderDatabaseStats(state.databaseStats);
	}
	if(state.uploadSettings) {
		renderUploadSettings(state.uploadSettings);
	}

	if(state.files.uploadProgress) {
		document.querySelector('progress#progress').value = state.files.uploadProgress;
	}
});
*/

store.dispatch(
	refreshDatabaseStats(
		store.getState().get('databaseID')
	)
);
store.dispatch(getRoles());
