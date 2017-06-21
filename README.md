
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
import { Provider, connect, shapes, } from 'none-dux';
```

init Provider:
```
const initialState = {
  request: {},
  todosByUser: {},
  users: {},
};

/*
shape is optional. The only effect is that you will get console warnings 
during development, when shape breaks specification.
*/
const { spec, any, array, object, number, string, exclusive, isRequired, bool, } = shapes;

const shape = {
  todosByUser: { [spec]:{ type: object, isRequired, }, 
    [any]: { [spec]: { type: object},                   // byUserIds 
        [any]: { [spec]: { type: object, exclusive},    // byTodoIds.  'exclusive' console errors when values outside of spec are added
          userId: {[spec]: { type: string, isRequired, }, },  // 'isRequired' console errors when userId is not spesified in todo object
          id: { [spec]: { type: string, isRequired}, },
          description: { [spec]: { type: string, isRequired, }, },
          done: { [spec]: { type: bool, }, },
    },
  },
  users: { [spec]: { type: object, }, // by id
     [any]: {
      id: { [spec]: {type: string, }, },
      firstName: { [spec]: { type: string, },
      lastName: { [spec]: {type: string, },     
    },
  },
  request: {[spec]: {type: object, isRequired}}
};

/*
using shape makes the performance significantly slower in dev environment
shape is ignored when NODE_ENV === 'production'
*/

const root = (
  <Provider 
  initialState={initialState} 
  shape={shape} 
  onChange={(store, lastChange) => {/* ... */}}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...

```

action creators / actions:
```
export function removeUser(userId) {
   return function ({users, todosByUser, }) {
    const user = users[userId];
    const usersTodos = todosByUser[userId]
    user.setState({ pending: true, });
    deleteUser(userId)
      .then(()=> {
        users.remove(userId);
        userTodos.removeSelf();
      }); 
  }
}


export function toggleTodo(id,userId){
  return function(store){
    const todo = store.todosByUser[id];
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
```
or without decorators:
```
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
target.removeSelf(); //remove self
```

State of the store is can be reformed at any time:

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
firstSubChild.removeSelf(); 

parent.setState('no children'); // ends up removing child and secondSubChild
```





```
Behavior of state can be misleading when using arrays because array state is not merged

cosnt store = createStore([1, 2, 3]); // state = [1, 2, 3]
store.setState({a: 4, b: 5})          // state = {a: 4, b: 5}
store.setState({b: 6, c: 7})          // state = {a: 4, b: 6, c: 7}
store.setState([1, 2, 3]);            // state = [1, 2, 3]
store.setState([4, 5]);               // state = [4, 5]
```

<img width="1025" alt="screenshot" src="https://cloud.githubusercontent.com/assets/11061511/26591980/0a8fe422-4568-11e7-93cc-1d083640a6ca.png">
All parts of the store is its own substore. But only root store can be subscribed
