'use strict'

import * as Immutable from 'immutable';
import {
	DATABASESTATS_REFRESH_INTENT,
	DATABASESTATS_REFRESH_RECEIPT,
	DATABASESTATS_REFRESH_ERROR,
	DATABASE_CLEAR_INTENT,
	DATABASE_CLEAR_RECEIPT,
	DATABASE_CLEAR_ERROR,
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
	FILES_UPLOAD_RECEIVE,
	ROLES_GET_INTENT,
	ROLES_GET_RECEIPT,
	ROLES_GET_ERROR,
	FORMAT_CLEAR_INTENT,
	FORMAT_CLEAR_RECEIPT,
	FORMAT_CLEAR_ERROR
} from '../actions';

const initialState = Immutable.fromJS({
	databaseID: '16204519326364673683',
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
);

export function reducer(state = initialState, action) {
	console.info('%s: %s', action.type, Object.keys(action).filter(k => 'type' !== k).join(', '));
	// let newState = Object.assign({}, state);
	switch (action.type) {

		case DATABASESTATS_REFRESH_INTENT:
			return state.updateIn(['isFetchingDatabaseStats'], current => true);
		case DATABASESTATS_REFRESH_RECEIPT:
			return state.merge({isFetchingDatabaseStats: false, databaseStats: action.stats});
		case DATABASESTATS_REFRESH_ERROR:
			console.warn(DATABASESTATS_REFRESH_ERROR);
			return state; // TODO: Handle database refresh error
		case DATABASE_CLEAR_INTENT:
	  case DATABASE_CLEAR_RECEIPT:
		case DATABASE_CLEAR_ERROR:
			return state; // TODO
		case FORMAT_CLEAR_INTENT:
		case FORMAT_CLEAR_RECEIPT:
		case FORMAT_CLEAR_ERROR:
			return state.merge({databaseStats: null});
		case COLLECTION_CLEAR_INTENT:
		case COLLECTION_CLEAR_RECEIPT:
		case COLLECTION_CLEAR_ERROR:
			console.warn(action.type);
			return state;
		case URI_POLICY_CHANGE:
			// console.info('Affecting URI_POLICY_CHANGE from %s to %s', state.getIn(['uploadSettings', 'uri']), action.uriPolicy);
			return state.updateIn(['uploadSettings', 'uri'], current => action.uriPolicy);
		case COLLECTION_ENABLED_CHANGE:
			// Find the collection and change its `enabled` property.
			const path = ['uploadSettings', 'collections', 'user'];
			const list = state.getIn(path)
				.map(
					coll => {
						if(coll.get('name') === action.collection) {
							return coll.merge({enabled: action.enabled});
						}
						return coll;
					}
				);
			return state.setIn(path, list);
/*
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
		// case ROLES_GET_INTENT:
		// case ROLES_GET_ERROR:
		case ROLES_GET_RECEIPT:
			newState.uploadSettings.permissions.cachedRoles = action.roles;
			return newState;
*/
		default:
			console.warn('default state');
			return state;
	}
}
