React application state handling
Syntax much like react-redux, with thunk.
Uses redux devtools.

No reducers no action types.
Easy to work with deep structured state.
All changes are immutable.
Shape of the state can be extended and modified at anytime.  
All part of the state is it's own sub-store
Direction of the flow is reversed compared to React.Component: When ever a child generates a new state, it's parent and grand parents... will generated to new state as well and the Provider gets notified.


import
```
import {Provider, connect} from 'none-dux';
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

action creators:
```
/* setState works like with react component, 
what ever you specify get updated and a new application state is generated */
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
    /*all parts of the store has state and previous state*/
    updateTodo(id, state)
      .then(({data: nextState}) => todo.clearState(nextState))
      .catch(() => todo.clearState(prevState))
      /* clear state works like setState, but it remove all the non specified values from next state*/
  }
}
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

Other methods:
```
target.remove(...ids);
target.remove(); //self
```

Dynamically changing state;

```
const store = createStore({parent:{}})
store.subscribe(() => {
  //get notified ones after every function call
  console.log(store.state);
  console.log(store.prevState);
  console.log(SubStore.lastInteraction);
})
const {parent} = store;
const {child} = parent.setState({
      child: {
        firstSubChild: {
          role: 'first', children: false
        },
        secondSubChild: {
          role: 'second'
        }
     }
   });
const {firstSubChild, secondSubChild} = child;
firstSubChild.remove(); // changing the state of firstSubChild will cause an error fron now on
const {state, prevState} = secondSubChild.clearState({onlyChild: true});
console.log(state); //{onlyChild: true}
console.log(prevState); //'{role: 'second'};
```


<img width="1025" alt="screenshot" src="https://cloud.githubusercontent.com/assets/11061511/26591980/0a8fe422-4568-11e7-93cc-1d083640a6ca.png">

