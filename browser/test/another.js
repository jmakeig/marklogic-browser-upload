'use strict'

import test from 'tape-catch';
import {Map} from 'immutable';

test('Here is another test', (assert) => {
  const m = Map({asdf: 'asdf'});
  assert.equal(4, 2+2);
  assert.end();
});
