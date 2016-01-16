export const DATABASE_STATS_REFRESH = 'DATABASE_STATS_REFRESH';
export const DATABASE_STATS_RECEIVE = 'DATABASE_STATS_RECEIVE';
export const COLLECTION_CLEAR_INTENT = 'COLLECTION_CLEAR_INTENT';
export const COLLECTION_CLEAR_RECEIVE = 'COLLECTION_CLEAR_RECEIVE';
export const URI_POLICY_CHANGE = 'URI_POLICY_CHANGE';
export const PERMISSION_CHANGE = 'PERMISSION_CHANGE';
export const PERMISSION_DEFAULTS_CHANGE = 'PERMISSION_DEFAULTS_CHANGE';
export const COLLECTION_ENABLED_CHANGE = 'COLLECTION_CHANGE_ENABLED';
export const COLLECTION_DEFAULTS_CHANGE = 'COLLECTION_ENABLED_CHANGE';
export const COLLECTION_BATCH_CHANGE = 'COLLECTION_BATCH_CHANGE';
export const FILES_SPECIFY = 'FILES_SPECIFY';
export const FILES_UPLOAD_INTENT = 'FILES_UPLOAD_INTENT';
export const FILES_UPLOAD_RECEIVE = 'FILES_UPLOAD_RECEIVE';
export const FILES_UPLOAD_ERROR = 'FILES_UPLOAD_ERROR';

// Action creator
function refreshDatabaseStats(id){
	return {
		type: DATABASE_STATS_REFRESH,
		id: id
	}
}

function receiveDatabaseStats(id, stats) {
	return {
		type: DATABASE_STATS_RECEIVE,
		id: id,
		stats: stats
	}
}

// Thunk action creator
export function fetchDatabaseStats(id) {
	return function(dispatch) {
		dispatch(refreshDatabaseStats(id));

		return getDatabaseStats(id)
			.then(function(stats) {
				dispatch(receiveDatabaseStats(id, stats))
			});
			// TODO: .catch()
	}
}

/**
 *
 * @param  {[type]} handler [description]
 * @return {Promise}
 */
function getDatabaseStats(id) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/marklogic/endpoints/database.sjs');
    xhr.onload = function() {
      // TODO: Check status code and reject accordingly
      resolve(JSON.parse(xhr.responseText));
    };
    xhr.onerror = function() {
      reject(Error('Network Error'));
    };
    xhr.send();
  });
}

// Action creator
function intendCollectionClear(collection) {
	return {
		type: COLLECTION_CLEAR_INTENT,
		collection: collection
	}
}

// Action creator
function receiveCollectionCleared(collection) {
	return {
		type: COLLECTION_CLEAR_RECEIVE,
		collection: collection
	}
}

// Thunk action creator
export function clearCollection(collection) {
	return function(dispatch) {
		dispatch(intendCollectionClear(collection));

		return deleteCollection(collection)
			.then(function(coll) { // FIXME: This returns { collections: […]}, not a string
				dispatch(receiveCollectionCleared(coll))
			})
			.then(function() {
				dispatch(fetchDatabaseStats(undefined)); // FIXME: How do I chain actions?
			});
			// TODO: .catch()
	}
}

export function changeURIPolicy(uriPolicy) {
	return {
		type: URI_POLICY_CHANGE,
		uriPolicy: uriPolicy
	}
}

export function changeCollectionEnabled(collection, enabled) {
	return {
		type: COLLECTION_ENABLED_CHANGE,
		collection: collection,
		enabled: enabled
	}
}

export function changeCollectionDefaults(enabled) {
	return {
		type: COLLECTION_DEFAULTS_CHANGE,
		enabled: enabled
	}
}

export function changeCollectionBatch(enabled) {
	return {
		type: COLLECTION_BATCH_CHANGE,
		enabled: enabled
	}
}

export function changePermission(role, capabilities) {
	return {
		type: PERMISSION_CHANGE,
		role: role,
		capabilities: capabilities
	}
}

export function changePermissionDefaults(enabled) {
	return {
		type: PERMISSION_DEFAULTS_CHANGE,
		enabled: enabled
	}
}

export function specifiedFiles(files) {
	return {
		type: FILES_SPECIFY,
		files: files
	}
}

// TODO: Should I pass in FormData (easy) or recreate basically the same thing
// from the store state (hard and requires back-end work)?
export function uploadFiles(formData) {
	return function(dispatch, getState) {
		dispatch(intendUploadFiles());
		return doUploadFiles(formData, (progress) => dispatch(intendUploadFiles(progress)))
			.then(function(ack) {
				console.log('Uploaded files');
				dispatch(receivedUploadFiles(ack))
			})
			.catch(function(error){
				console.error(error);
				dispatch(errorUploadFiles(error));
			});
	}
}

function intendUploadFiles(progress = 0.0) {
	return {
		type: FILES_UPLOAD_INTENT,
		progress: progress
	}
}

function receivedUploadFiles(ack) {
	return {
		type: FILES_UPLOAD_RECEIVE
	}
}

function errorUploadFiles(error) {
	return {
		type: FILES_UPLOAD_ERROR,
		error: error
	}
}

/**
 *
 * @param  {[type]} handler [description]
 * @return {Promise}
 */
function doUploadFiles(data, progressHandler) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/marklogic/upload.sjs');
    xhr.onload = function() {
      // TODO: Check status code and reject accordingly
      resolve(JSON.parse(xhr.responseText));
    };
    xhr.onerror = function() {
      reject(Error('Network Error'));
    };
		xhr.upload.onprogress = function(event) {
			if(event.lengthComputable) {
	      progressHandler(event.loaded / event.total);
	    }
		};
    xhr.send(data);
  });
}
