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
	databaseStats: {
	  "id": "16204519326364673683",
	  "name": "Documents",
	  "documentsCount": 0,
	  "propertiesCount": 0,
	  "collections": [
	    {
	      "name": "(none)",
	      "count": 0,
	      "isNone": true,
				isUpdated: false // Use this to indicate something that the UI should highlight as changed
	    }
	  ],
	  "batches": [],
	  "documentFormats": [
	    {
	      "format": "json",
	      "count": 0
	    },
	    {
	      "format": "xml",
	      "count": 0
	    },
	    {
	      "format": "binary",
	      "count": 0
	    },
	    {
	      "format": "text",
	      "count": 0
	    }
	  ]
	},
	files: {
		uploadProgress: null,
		fileList: null
	},
	uploadSettings: {
		uri: 'filename', // id, uuid
		collections: {
			user: [
					// {
					// 	name: '',
					// 	enabled: true
					// }
			],
			batch: true,
			'default': true
		},
		permissions: {
			user: [
				// 'some-role': ['read', 'update', 'insert', 'execute']
			],
			'default': true,
			cachedRoles: null // Pre-load the roles from the server for auto-suggest
		}
	}
}

export function reducer(state = initialState, action) {
	switch (action.type) {
		case 'DATABASE_STATS_REFRESH':
			return Object.assign({}, state, {isFetchingDatabaseStats: true});
			break;
		case 'DATABASE_STATS_RECEIVE':
			console.dir(action);
			return Object.assign({}, state, {isFetchingDatabaseStats: false, databaseStats: action.stats});
			break;
		case 'COLLECTION_CLEAR_INTENT': // TODO: Put spinner indicator for individual collection?
		case 'COLLECTION_CLEAR_RECEIVE':
			return state;
			break;
		case 'URI_POLICY_CHANGE':
			// FIXME: This is ugly. Is there a way to do it without a temp variable?
			var newState = Object.assign({}, state);
			newState.uploadSettings.uri = action.uriPolicy;
			return newState;
		default:
			console.warn('default state');
			return state;
	}
}
