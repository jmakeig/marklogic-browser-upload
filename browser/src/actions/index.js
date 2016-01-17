export const DATABASE_STATS_REFRESH = 'DATABASE_STATS_REFRESH';
export const DATABASE_STATS_RECEIVE = 'DATABASE_STATS_RECEIVE';
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
			// FIXME: This is really ugly, having to tightly couple the clear
			// collection and refresh database stats.
			.then(() => dispatch(fetchDatabaseStats(undefined)))
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

/* Collection clear ***********************************************************/

export const COLLECTION_CLEAR_INTENT  = 'COLLECTION_CLEAR_INTENT';
export const COLLECTION_CLEAR_RECEIPT = 'COLLECTION_CLEAR_RECEIPT';
export const COLLECTION_CLEAR_ERROR   = 'COLLECTION_CLEAR_ERROR';

/**
 * Ansynchronously clear a collection. Clearning a collection removes all of
 * the documents associated with that collection, even documents that
 * are in other collections.
 * Dispatches intent, receipt, and error lifecycle events.
 * @param  {string} collection The collection URI
 * @return {function} The thunk
 */
export function clearCollection(collection) {
	return function(dispatch, getState) {
		dispatch(intendClearCollection());
		return doClearCollection(collection)
			.then(function(receipt) {
				console.log('Clear Collection');
				dispatch(receivedClearCollection(receipt));
			})
			// FIXME: This is really ugly, having to tightly couple the clear
			// collection and refresh database stats.
			.then(() => dispatch(fetchDatabaseStats(undefined)))
			.catch(function(error){
				console.error(error);
				dispatch(errorClearCollection(error));
			});
	}
}

/**
 * Perform the actual asynchronous work.
 * @param  {string} collection The collection URI
 * @return {Promise}
 */
function doClearCollection(collection) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/marklogic/endpoints/documents.sjs?coll=' + collection);
    xhr.onload = function() {
      if(this.status < 300) {
        resolve(JSON.parse(this.responseText));
      } else if (this.status >= 300) {
        let error = new Error(this.responseText);
        error.httpStatus = this.statusText;
        error.httpCode = this.status;
        reject(error);
      }
    };
    xhr.onerror = function() {
      // TODO: Get error messsage
      reject(new Error('Network Error'));
    };
    xhr.send();
  });
}

/**
 * Synchronous action declaring the intent to clear a collection.
 * @param  {string} collection The collection URI
 * @param  {number} progress = 0.0 The amount of progress, from 0 to 1.0
 * @return {Object} The intent action
 */
function intendClearCollection(collection, progress = 0.0) {
  return {
    type: COLLECTION_CLEAR_INTENT,
		collection: collection,
    progress: progress
  }
}

/**
 * Synchronous action dispatched from the asynchronous `clearCollection` indicating
 * that the remote service has successfully returned data.
 * @param  {Object} receipt The data returned from the service
 * @return {Object} The action
 */
function receivedClearCollection(receipt) {
  return {
    type: COLLECTION_CLEAR_RECEIPT,
    receipt: receipt
  }
}

/**
 * Synchronous action dispatched from the asynchronous `clearCollection` indicating
 * that the remote service wasn’t able to complete because of an error.
 * @param  {Object} error An `Error` instance with custom properties
 *                        indicating specifics of the failure
 * @return {Object} The action
 */
function errorClearCollection(error) {
  return {
    type: COLLECTION_CLEAR_ERROR,
    error: error
  }
}

/* Get roles *****************************************************************/

export const ROLES_GET_INTENT  = 'ROLES_GET_INTENT';
export const ROLES_GET_RECEIPT = 'ROLES_GET_RECEIPT';
export const ROLES_GET_ERROR   = 'ROLES_GET_ERROR';

/**
 * The top-level asynchronous action creator.
 * Dispatches intent, receipt, and error lifecycle events.
 * @return {function} The thunk
 */
export function getRoles() {
	return function(dispatch, getState) {
		dispatch(intendGetRoles());
		return doGetRoles()
			.then(function(roles) {
				console.dir(roles);
				dispatch(receivedGetRoles(roles));
			})
      // .then( Dispatch subsequent actions here. )
			.catch(function(error){
				console.error(error);
				dispatch(errorGetRoles(error));
			});
	}
}

/**
 * Perform the actual asynchronous work. There shouldn't be anything
 * action-specific in here, just business logic.
 * @return {Promise}
 */
function doGetRoles() {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/marklogic/endpoints/roles.sjs');
    xhr.onload = function() {
      if(this.status < 300) {
        resolve(JSON.parse(this.responseText));
      } else if (this.status >= 300) {
        let error = new Error(this.responseText);
        error.httpStatus = this.statusText;
        error.httpCode = this.status;
        reject(error);
      }
    };
    xhr.onerror = function() {
      // TODO: Get error messsage
      reject(new Error('Network Error'));
    };
    xhr.send();
  });
}

/**
 * Synchronous action declaring the intent to get a roles. Use this action
 * to indicate progress on completing the task as well, for example from a file
 * upload XHR request.
 * @param  {number} progress = 0.0 [description]
 * @return {Object} The intent action
 */
function intendGetRoles(progress = 0.0) {
  return {
    type: ROLES_GET_INTENT,
    progress: progress
  }
}

/**
 * Synchronous action dispatched from the asynchronous `getRoles` indicating
 * that the remote service has successfully returned data.
 * @param  {Object} receipt The data returned from the service
 * @return {Object} The receipt action
 */
function receivedGetRoles(roles) {
  return {
    type: ROLES_GET_RECEIPT,
    roles: roles
  }
}

/**
 * Synchronous action dispatched from the asynchronous `getRoles` indicating
 * that the remote service wasn’t able to complete because of an error.
 * @param  {Error} error An `Error` instance with custom properties
 *                        indicating specifics of the failure
 * @return {Object} The action
 */
function errorGetRoles(error) {
  return {
    type: ROLES_GET_ERROR,
    error: error
  }
}
