'use strict'

import {
	DATABASE_STATS_REFRESH,
	DATABASE_STATS_RECEIVE,
	COLLECTION_CLEAR_INTENT,
	COLLECTION_CLEAR_RECEIVE,
	URI_POLICY_CHANGE
} from '../actions';

const initialState = {
	databaseID: "16204519326364673683",
	isFetchingDatabaseStats: false,
	locale: navigator.language,
	databaseStats: null,
	files: {
		uploadProgress: null,
		fileList: null
	},
	uploadSettings: {
		uri: 'filename', // filename, id, uuid
		collections: {
			user: [
					{
						name: 'production',
						enabled: true
					},
					{
						name: 'staging',
						enabled: true
					},
					{
						name: '/some/other',
						enabled: false
					}
			],
			batch: true,
			'default': true
		},
		permissions: {
			// 'read', 'update', 'insert', 'execute'
			user: {
				'rest-reader': ['read', 'insert'],
				'rest-writer': ['read', 'update', 'insert']
			},
			'default': true,
			cachedRoles: null // Pre-load the roles from the server for auto-suggest
		}
	}
}

export function reducer(state = initialState, action) {
	switch (action.type) {
		case DATABASE_STATS_REFRESH:
			return Object.assign({}, state, {isFetchingDatabaseStats: true});
			break;
		case DATABASE_STATS_RECEIVE:
			// console.dir(action);
			return Object.assign({}, state, {isFetchingDatabaseStats: false, databaseStats: action.stats});
			break;
		case COLLECTION_CLEAR_INTENT: // TODO: Put spinner indicator for individual collection?
		case COLLECTION_CLEAR_RECEIVE:
			return state;
			break;
		case URI_POLICY_CHANGE:
			// FIXME: This is ugly. Is there a way to do it without a temp variable?
			var newState = Object.assign({}, state);
			newState.uploadSettings.uri = action.uriPolicy;
			return newState;
		default:
			console.warn('default state');
			return state;
	}
}
