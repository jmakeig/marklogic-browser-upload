'use strict'

var stats = require('../stats.sjs');

if('GET' === xdmp.getRequestMethod()) {
  var roleInputs = xdmp.getRequestField('role', '*');
  xdmp.addResponseHeader('Content-Type', 'application/json; charset=utf-8');
  stats.roles(roleInputs); // UGLY having to pass in a wildcard string
} else {
  xdmp.setResponseCode(405, 'Method not supported');
}
