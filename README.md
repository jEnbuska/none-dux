React application state handling
Syntax much like react-redux, with thunk.
Uses redux devtools when NODE_ENV === 'devepolment'.

No reducers no action types.

Easy to work with deep structured state.

All changes are immutable.

Shape of the state can be extended and modified at anytime.  

All part of the state is it's own sub-store

Direction of the flow is reversed compared to React.Component: 

When ever a child generates a new state, it's parent and grand parents... will generated to new state as well and the Provider gets notified.


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
/* setState works like with react components state, 
what ever you specify gets updated and a new application state is generated */
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
  ({ request, users, }, props) => ({ request, user: users[props.params.userId], }),
  ({ changeUserName, fetchUsers, addUser, removeUser, })
)
export default class Users extends React.Component {
  ...
```

Other methods:
```
target.remove(...ids); //removes with matching ids and all their sub children
target.remove(); //remove self
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
firstSubChild.remove(); // changing the state of firstSubChild will throw an error from now on
const {state, prevState} = secondSubChild.clearState({onlyChild: true});
console.log(state); //{onlyChild: true}
console.log(prevState); //'{role: 'second'};
```

Working with deep structured store state:

```
// lets say you have a model like this an you would like to remove all users appointments when user is removed
const exampleShapeOfState = {
    users: {
      [userId]: {id: [userId], name: ..., address: ..., ...}, ...
    }
    appointmentsByWeek: {
       [weekNumber]: appointmentsByDay: {
          [weekDayNumber]: {
             [appointmentId]: {userId: [userId], appointmentId: [appointmentId], type: ..., something:...}
          }, ...
       }, ...
    }
 }

const user = store.users[userId];
const {id} = user.state;

store.appointmentsByWeek.getChildrenRecursively()
  .filter(child => child.userId)
  .filter(({state})=> state.userId === id)  
  .forEach(appointment => appointment.remove())

user.remove();

/*or
...
 const appointments = store.appointmentsByWeek.getChildrenRecursively()
  .filter(child => child.userId)
  .filter(({state})=> state.userId === id)
 appointments.length && appointments[0].getParent().remove(...appointments.map(ap => ap.getId()))
... 
*/

```


<img width="1025" alt="screenshot" src="https://cloud.githubusercontent.com/assets/11061511/26591980/0a8fe422-4568-11e7-93cc-1d083640a6ca.png">

Limitations:
Does not play well with arrays yet:
```
const subStore.setState(['a','b','c'])
console.log(subStore.state); // {1:'a', 2:'b', 3:'c'};
```
Does not yet work with functions as state variables?


