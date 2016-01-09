import 'number-to-locale-string';
import {createStore} from 'redux';
import {DATABASE_STATS_REFRESH} from './actions'
createStore(() => 4);
console.log('Say, "%s"', DATABASE_STATS_REFRESH);
