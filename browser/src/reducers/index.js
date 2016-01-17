'use strict'

import {
	DATABASE_STATS_REFRESH,
	DATABASE_STATS_RECEIVE,
	COLLECTION_CLEAR_INTENT,
	COLLECTION_CLEAR_RECEIPT,
	COLLECTION_CLEAR_ERROR,
	URI_POLICY_CHANGE,
	COLLECTION_ENABLED_CHANGE,
	COLLECTION_DEFAULTS_CHANGE,
	COLLECTION_BATCH_CHANGE,
	PERMISSION_CHANGE,
	PERMISSION_DEFAULTS_CHANGE,
	FILES_SPECIFY,
	FILES_UPLOAD_INTENT,
	FILES_UPLOAD_RECEIVE
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
	let newState = Object.assign({}, state);
	switch (action.type) {
		case DATABASE_STATS_REFRESH:
			return Object.assign(newState, state, {isFetchingDatabaseStats: true});
			break;
		case DATABASE_STATS_RECEIVE:
			// console.dir(action);
			return Object.assign(newState, state, {isFetchingDatabaseStats: false, databaseStats: action.stats});
			break;
		case COLLECTION_CLEAR_INTENT:
		case COLLECTION_CLEAR_RECEIPT:
		case COLLECTION_CLEAR_ERROR:
			return state;
			break;
		case URI_POLICY_CHANGE:
			// FIXME: This is ugly. Is there a way to do it without a temp variable?
			newState.uploadSettings.uri = action.uriPolicy;
			return newState;
		case COLLECTION_ENABLED_CHANGE:
			// FIXME: This is ugly. Isn't there a better way to do this?
			// Find the collection and change its `enabled` property.
			newState.uploadSettings.collections.user =
				newState.uploadSettings.collections.user.map(
					function(coll) {
						if(action.collection === coll.name) {
							coll.enabled = action.enabled;
							return coll;
						}
						return coll;
					}
				);
		case COLLECTION_DEFAULTS_CHANGE:
			newState.uploadSettings.collections.default = action.enabled;
			return newState;
		case COLLECTION_BATCH_CHANGE:
			newState.uploadSettings.collections.batch = action.enabled;
			return newState;
		case PERMISSION_CHANGE:
			newState.uploadSettings.permissions.user[action.role] = action.capabilities;
			return newState;
		case PERMISSION_DEFAULTS_CHANGE:
			newState.uploadSettings.permissions.default = action.enabled;
			return newState;
		case FILES_SPECIFY:
			newState.files.fileList = action.files;
			return newState;
		case FILES_UPLOAD_INTENT:
			newState.files.uploadProgress = action.progress;
			console.info('Progress %d%%', action.progress * 100);
			return newState;
		case FILES_UPLOAD_RECEIVE:
			newState.files.uploadProgress = 1;
			newState.files.fileList = null;
			return newState;
		default:
			console.warn('default state');
			return state;
	}
}
