'use strict'

// import 'number-to-locale-string';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import {
	fetchDatabaseStats,
	changeURIPolicy,
	changePermission,
	changePermissionDefaults,
	changeCollectionEnabled,
	changeCollectionDefaults,
	changeCollectionBatch,
	specifiedFiles
} from './actions';
import {reducer} from './reducers';
import {bindRenderDatabaseStats} from './components/databaseStats';
import {bindRenderUploadSettings} from './components/uploadSettings';


const PERMISSION_NAMESPACE = 'permission*';

// function escapeCSS(str) {
// 	return str.replace(/(\*:)/g, (match, $1, offset, original) => '\\$1');
// }
function changeHandler(evt){
	let target = evt.target;
	console.log('Changed %s', target.name);
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

store.subscribe(() => {
	console.dir(store.getState());
	const state = store.getState();
	if(state.databaseStats) {
		renderDatabaseStats(store.getState().databaseStats);
	}
	if(state.uploadSettings) {
		renderUploadSettings(state.uploadSettings);
	}
});

/*
function observeStore(store, select, onChange) {
  let currentState;

  function handleChange() {
		//console.log(((currentState || {})['uploadSettings'] || {}).uri);
		console.log(currentState === store.getState());
		try {
			console.log(currentState.uploadSettings.uri == store.getState().uploadSettings.uri);
		} catch (e) {
			console.warn('oops');
		}

    let nextState = select(store.getState());
    if (nextState !== currentState) {
      currentState = nextState;
      onChange(currentState);
    }
  }

  let unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
}

observeStore(
	store,
	x => x,
	//(prev, curr) => console.log('prev: %s, curr: %s', prev.uploadSettings.uri, curr.uploadSettings.uri)
	x => x
);
*/


function fileSelectHandler(evt) {
  let files = evt.target.files; // FileList
  //sendFiles(files);
}
document.querySelector('#fileselect').addEventListener('change', fileSelectHandler, false);

function dropHandler(evt) {
	evt.preventDefault();
	evt.stopPropagation();
  // console.dir(evt.target);
  if(this === evt.target) {
    //sendFiles(evt.dataTransfer.files);
    store.dispatch(specifiedFiles(evt.dataTransfer.files));
  }
}
document.querySelector('#filedrag').addEventListener('drop', dropHandler);

function dragHover(evt) {
  evt.stopPropagation();
	evt.preventDefault();
}
document.querySelector('#filedrag').addEventListener('dragover', dragHover, false);
document.querySelector('#filedrag').addEventListener('dragleave', dragHover, false);




store.dispatch(fetchDatabaseStats(undefined));
