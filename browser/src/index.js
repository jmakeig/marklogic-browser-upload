'use strict'

// import 'number-to-locale-string';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import {fetchDatabaseStats, changeURIPolicy} from './actions';
import {reducer} from './reducers';
import {bindRenderDatabaseStats} from './components/databaseStats';
import {bindRenderUploadSettings} from './components/uploadSettings';


function changeHandler(evt){
	let target = evt.target;
	switch (target.name) {
		case 'uris':
			store.dispatch(changeURIPolicy(target.value));
			break;
		default:
			//
	}
}
document.querySelector('form').addEventListener('change', changeHandler, true);


const store = applyMiddleware(thunk)
	(createStore) // middleware store creator
		(reducer); // create the store

const renderDatabaseStats = bindRenderDatabaseStats(document.querySelector('#database'));
const renderUploadSettings = bindRenderUploadSettings(
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
);

store.subscribe(function() {
	console.log(store.getState());
	const state = store.getState();
	if(state.databaseStats) {
		renderDatabaseStats(store.getState().databaseStats);
	}
	renderUploadSettings(state.uploadSettings);
});

store.dispatch(fetchDatabaseStats(undefined));
