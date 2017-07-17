const { parse, stringify, } = JSON;

export default {
  storeItem: ({ token, }) => localStorage.setItem('token', token),
  clearItem: (key) => localStorage.removeItem(key),
  login: ({ email, password, }) => {
    let users = localStorage.getItem('saga_users');
    let user;
    if (users) {
      users = parse(users);
      user = users[email] && users[email][password];
    }
    return new Promise((resolve, reject) => setTimeout(() => user ? resolve({ ...user, token: 'abc', }) : reject({ msg: 'wrong username or password', }), 1200));
  },

  signup: ({ email, password, firstname, lastname, zip, city, address, phone, }) => {
    let users = localStorage.getItem('saga_users');
    let preExisting;
    if (users) {
      users = parse(users);
    } else {
      users = {};
    }
    if (users[email]) {
      preExisting =true;
    } else {
      users[email] = { [password]: { email, password, firstname, lastname, zip, city, address, phone, }, };
      localStorage.setItem('saga_users', stringify(users));
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => preExisting ? reject({ msg: 'email already taken', }) : resolve({ token: 'abc', }), 1200);
    });
  },

  refreshToken: () => new Promise(resolve => setTimeout(() => resolve('abc'), 800)),

  timeUntilTokenExpiration: 60*60*1000,
  onTermsAccepted: ({ email, }) => {
    const users = parse(localStorage.getItem('saga_users'));
    let user = users[email];
    const pass = Object.keys(users[email])[0]
    user = user[pass]
    user.termsAccepted = true;
    localStorage.setItem('saga_users', stringify(users));
    return new Promise(resolve => setTimeout(() => resolve(), 800));
  },
  getToken() {
    let token = localStorage.getItem('token');
    token = token && parse(token);
    if (true) { // expired
      return null;
    }
    return token;
  },
};

