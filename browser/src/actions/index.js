export const DATABASE_STATS_REFRESH = 'DATABASE_STATS_REFRESH';
export const DATABASE_STATS_RECEIVE = 'DATABASE_STATS_RECEIVE';
export const COLLECTION_CLEAR_INTENT = 'COLLECTION_CLEAR_INTENT';
export const COLLECTION_CLEAR_RECEIVE = 'COLLECTION_CLEAR_RECEIVE';
export const URI_POLICY_CHANGE = 'URI_POLICY_CHANGE';


// Action creator
function refreshDatabaseStats(id){
	return {
		type: 'DATABASE_STATS_REFRESH',
		id: id
	}
}

function receiveDatabaseStats(id, stats) {
	return {
		type: 'DATABASE_STATS_RECEIVE',
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
      reject(Error("Network Error"));
    };
    xhr.send();
  });
}

// Action creator
function intendCollectionClear(collection) {
	return {
		type: 'COLLECTION_CLEAR_INTENT',
		collection: collection
	}
}

// Action creator
function receiveCollectionCleared(collection) {
	return {
		type: 'COLLECTION_CLEAR_RECEIVE',
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
