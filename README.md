React application state handling
Syntax much like react-redux, with thunk

No reducers no action types

import
```
import {Provider, connect} from 'none-dux';
```
action creators:
```
export function removeUser(id) {
   return function (store) {
    const user = store.users[id];
    user.setState({ pending: true, });
    deleteUser(id)
      .then(()=> user.remove()); 
      //or store.users.remove(id)
  };
}

export function toggleTodo(id){
  return function({todos: {[id]: todo}){
    const { state: {done}, } = todo;
    const { state, prevState, } = todo.setState({pending: true, done: !done});
    updateTodo(id, state)
      .then(({data: nextState}) => todo.clearState(nextState))
      .catch(() => todo.clearState(prevState))
      //or store.todos.setState({[id]: prevState});
  }
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
[[https://github.com/jEnbuska/none-dux/master/Screen Shot 2017-05-30 at 18.31.37.png|alt=idea]]


Having Function in store is not supported
Having Arrays in store is not prefered, because all Arrays are transformed into Objects
