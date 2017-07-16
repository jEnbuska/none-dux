import { fork, spawn, take, cancel, call, put, } from 'redux-saga/effects';
import { delay, } from 'redux-saga';
import { ON_LEAVE_SIGNUP, ON_LEAVE_LOGIN, LOGIN_REQUEST, LOGIN_ERROR, LOGOUT, SIGNUP_REQUEST, SIGNUP_ERROR, ON_TERMS_ACCEPTED, REQUEST_TERMS_ACCEPTANCE, } from '../actions/types';
import client from '../mockClient';

let auth;
let dux;
export default function initAuthFlow(nonedux) {
  dux = nonedux;
  auth = nonedux.auth;
  return authFlow;
}

function* authFlow() {
  yield spawn(handleLeaveAuth);
  yield spawn(handleLogout);
  yield spawn(handleTerms);
  yield spawn(handleAuthError);
  while (true) {
    const { type, email, password, ...rest } = yield take([ SIGNUP_REQUEST, LOGIN_REQUEST, ]);
    switch (type) {
      case SIGNUP_REQUEST: {
        const task = yield fork(handleInitialFlow, { email, password, ...rest, });
        yield take([ SIGNUP_ERROR, LOGOUT, ]);
        yield cancel(task);
        break;
      } case LOGIN_REQUEST: {
        yield put(auth.setState({ pending: true, }));
        const task = yield fork(login, { email, password, });
        yield take([ LOGOUT, LOGIN_ERROR, ]);
        yield cancel(task);
        break;
      }
      default: break;
    }
  }
}

function* handleInitialFlow({ email, password, firstname, lastname, zip, city, address, }) {
  try {
    yield put(auth.setState({ pending: true, }));
    const { token, } = yield call(client.signup, { email, password, firstname, lastname, zip, city, address, });
    yield put(auth.setState({ pending: false, token, user: { token, email, firstname, lastname, zip, city, address, termsAccepted: false, }, }));
    yield call(client.storeItem, { token, });
    yield put({ type: REQUEST_TERMS_ACCEPTANCE, });
  } catch (error) {
    return yield put({ type: SIGNUP_ERROR, });
  }
  yield call(handleTokenRefresh);
}

function* login({ email, password, }) {
  try {
    const { firstname, lastname, termsAccepted, token, city, zip, address, } = yield call(client.login, { email, password, });
    yield put(auth.setState({ token, user: { email, firstname, lastname, city, zip, address, termsAccepted, }, }));
    yield call(client.storeItem, { token, });
    if (!termsAccepted) {
      yield put({ type: REQUEST_TERMS_ACCEPTANCE, });
    }
    yield call(handleTokenRefresh);
  } catch (error) {
    return yield put({ type: LOGIN_ERROR, });
  }
}

function* handleAuthError() {
  while (true) {
    yield take([ LOGIN_ERROR, SIGNUP_ERROR, ]);
    yield put(auth.setState({ error: true, pending: false, token: null, }));
  }
}

function* handleTokenRefresh() {
  try {
    while (true) {
      yield delay(client.timeUntilTokenExpiration);
      const { token, } = yield call(client.refreshToken);
      yield put(auth.setState({ token, }, true));
      yield call(client.storeItem, { token, });
    }
  } catch (error) {
    yield call(handleLoginError);
  }
}

function* handleTerms() {
  while (true) {
    yield take(REQUEST_TERMS_ACCEPTANCE);
    yield put(dux.setState({ blockContentInteraction: true, }));
    yield take(ON_TERMS_ACCEPTED);
    const { email, } = auth.user.state;
    yield call(client.onTermsAccepted, { email, });
    yield put(auth.user.setState({ termsAccepted: true, }));
    yield put(dux.setState({ blockContentInteraction: false, }));
  }
}

function* handleLeaveAuth() {
  while (true) {
    yield take([ ON_LEAVE_LOGIN, ON_LEAVE_SIGNUP, ]);
    yield put(auth.setState({ error: false, pending: false, }));
  }
}

function* handleLogout() {
  while (true) {
    yield take(LOGOUT);
    yield call(client.clearItem, 'token');
    yield put(auth.clearState({ user: {}, token: null, }));
  }
}

function* handleLoginError() {
  yield put(auth.setState({ pending: false, error: true, token: null, }));
  yield put({ type: LOGIN_ERROR, });
}
