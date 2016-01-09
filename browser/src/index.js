import 'number-to-locale-string';
import {createStore} from 'redux';
import {DATABASE_STATS_REFRESH} from './actions'
createStore(() => 4);
const num = 41234567890;
console.log('Say, "%s" and %s', DATABASE_STATS_REFRESH, num.toLocaleString('en-us'));
