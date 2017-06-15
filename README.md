
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Syntax much like react-redux, with thunk.
No reducers no action types needed.

Application state can be changed directly from actions 

Works partially with redux devtools (time travel state, displays diff, events and state):

Easy to work with deep structured state.

All changes are immutable.

Shape of the state can be extended and modified at anytime.  

All part of the state is it's own sub-store

Direction of the data flow is reversed compared to React.Component: 

When ever a child generates a new state, it's parent and grand parents... will generated to new state, upto until Provider gets notified.

imports
```
import {Provider, connect, shapes, } from 'none-dux';
```

init Provider:
```
const initialState = {
  todosById: {},
  usersById: {},
};

/*
shape is optional. The only effect is that you will get console warnings 
during development, when shape breaks specification
*/

const { TYPE, TARGET_ANY, VALIDATE, } = shapes;

const shape = {
  todosByUser: { [TYPE]: 'object',
    [TARGET_ANY]: { [TYPE]: 'object',       // byUserIds 
        [TARGET_ANY]: { [TYPE]: 'object',   // byTodoIds
          userId: {[TYPE]: 'string', },
          id: { [TYPE]: 'string', },
          description: { [TYPE]: 'string', },
          done: { [TYPE]: [ 'boolean', 'undefined', ], },
    },
  },
  usersById: { [TYPE]: 'object', // userId
     [TARGET_ANY]: {
      id: { [TYPE]: 'string', },
      firstName: { [TYPE]: 'string
        [VALIDATE]: name => name.length < 25, 
      },
      lastName: { [TYPE]: 'string', 
        [VALIDATE]: name => name.length < 25}, 
      },     
    },
  },
};

const root = (
  <Provider initialState={initialState} shape={shape}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...

```

action creators / actions:
```
export function removeUser(id) {
   return function ({users}) {
    const user = users[id];
    user.setState({ pending: true, });
    deleteUser(id)
      .then(()=> users.remove(id)); 
  }
}


export function toggleTodo(id){
  return function(store){
    const todo = store.todos[id];
    const { state: {done}, } = todo;
    const { state, prevState, } = todo.setState({pending: true, done: !done});
    updateTodo(id, state)
      .then(({data: nextState}) => todo.clearState(nextState))
      .catch(() => todo.clearState(prevState))
      /* clear state works like setState, but it remove all the non specified values from next state*/
  }
}
```

connect with class decorators:
```
@connect(
  ({ request, users, }, props) => ({ request, user: users[props.params.userId], }),
  ({ changeUserName, fetchUsers, addUser, removeUser, })
)
export default class MyComponent extends React.Component {
   render(){
      return (<div>...</div>)
   }
}
  
or without decorators:
  
const MyComponent = (props) => {
   return (<div>...</div>) 
}

export default connect(
   ({ request, users, }, props) => ({ request, user: users[props.params.userId], }),
   ({ changeUserName, fetchUsers, addUser, removeUser, }))(User)
```

Other methods:
```
target.remove(...ids); //removes all children with matching ids
target.remove(); //remove self
```

State of the store is not fixed:

```
const store = createStore({parent:{}})

const {parent} = store;
parent.setState({
      child: {
        firstSubChild: {
          role: 'first', children: false
        },
        secondSubChild: {
          role: 'second'
        }
     }
   });
const {firstSubChild, secondSubChild} = parent.child;
firstSubChild.remove(); 

parent.setState('no children'); // ends up removing child and secondSubChild
```

<img width="1025" alt="screenshot" src="https://cloud.githubusercontent.com/assets/11061511/26591980/0a8fe422-4568-11e7-93cc-1d083640a6ca.png">

Limitations / Todos:
```
1. Does not play well with arrays:
const subStore.setState(['a','b','c'])
console.log(subStore.state); // {1:'a', 2:'b', 3:'c'};
```
