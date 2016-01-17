/*
  A template for asynchronous action creator lifcycle.
  Use the `generate-actions.sh` script to create an instance.

  cat template.js | ./generate-actions.sh > my-actions.js
  
 */

'use strict'

const $NOUN_$VERB_INTENT  = '$NOUN_$VERB_INTENT';
const $NOUN_$VERB_RECEIPT = '$NOUN_$VERB_RECEIPT';
const $NOUN_$VERB_ERROR   = '$NOUN_$VERB_ERROR';

/**
 * The top-level asynchronous action creator.
 * Dispatches intent, receipt, and error lifecycle events.
 * @param  {Object} data The input sent to the remote request
 * @return {function} The thunk
 */
export function $verb$Noun(data) {
	return function(dispatch, getState) {
		dispatch(intend$Verb$Noun());
		return do$Verb$Noun(data)
			.then(function(receipt) {
				console.log('$Verb $Noun');
				dispatch(received$Verb$Noun(receipt));
			})
			.catch(function(error){
				console.error(error);
				dispatch(error$Verb$Noun(error));
			});
	}
}

/**
 * Perform the actual asynchronous work.
 * @param  {Object} data
 * @return {Promise}
 */
function do$Verb$Noun(data) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/$noun');
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
    xhr.send(data);
  });
}

/**
 * Synchronous action declaring the intent to $verb $noun.
 * @param  {number} progress = 0.0 [description]
 * @return {Object} The action
 */
function intend$Verb$Noun(progress = 0.0) {
  return {
    type: $NOUN_$VERB_INTENT,
    progress: progress
  }
}

/**
 * Synchronous action dispatched from the asynchronous `$verb$Noun` indicating
 * that the remote service has successfully returned data.
 * @param  {Object} receipt The data returned from the service
 * @return {Object} The action
 */
function received$Verb$Noun(receipt) {
  return {
    type: $NOUN_$VERB_RECEIPT,
    receipt: receipt
  }
}

/**
 * Synchronous action dispatched from the asynchronous `$verb$Noun` indicating
 * that the remote service wasn’t able to complete because of an error.
 * @param  {Object} error An `Error` instance with custom properties
 *                        indicating specifics of the failure
 * @return {Object} The action
 */
function error$Verb$Noun(error) {
  return {
    type: $NOUN_$VERB_ERROR,
    error: error
  }
}
