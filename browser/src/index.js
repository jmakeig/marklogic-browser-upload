'use strict'

// import 'number-to-locale-string';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import {DATABASE_STATS_REFRESH} from './actions';
import {fetchDatabaseStats} from './actions';
import {reducer} from './reducers';
import {renderDatabaseStats} from './components/databaseStats';
import {bindRenderUploadSettings} from './components/uploadSettings';

const store = applyMiddleware(thunk)
	(createStore) // middleware store creator
		(reducer); // create the store

store.subscribe(function() {
	console.log(store.getState());
	const state = store.getState();
	if(state.databaseStats) {
		renderDatabaseStats(document.querySelector('#database'), store.getState().databaseStats);
	}
	bindRenderUploadSettings()(state.uploadSettings);
});

store.dispatch(fetchDatabaseStats(undefined));
