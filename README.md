React application state handling
Syntax much like react-redux, with thunk

No reducers no action types

action creators:
```
export function removeUser(id) {
   return function (store) {
    const user = store.users[id];
    user.setState({ validated: false, });
    setTimeout(() => { // delete request to backend
      user.remove();
      // or users.remove(id)
    }, 1300);
  };
}
```
init Provider:
```
const initialState = {
  todos: {},
  users: {},
  request: { users: {}, todos: {}, },
};

const root = (
  <Provider initialState={initialState}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...

```

connect:
```
@connect(
  ({ users, request, }, props) => ({ users, request: request.users, }),
  ({ changeUserName, fetchUsers, addUser, removeUser, })
)
export default class Users extends React.Component {
  ...
```

Having Function in store is not supported
Having Arrays in store is not prefered, because all Arrays are transformed into Objects
