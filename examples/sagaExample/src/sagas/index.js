import { fork, } from 'redux-saga/effects';
import auth from './auth';

let nonedux;
export default function* sagaRoot() {
  nonedux = this;
  return yield [
    fork(auth(nonedux)),
  ];
}