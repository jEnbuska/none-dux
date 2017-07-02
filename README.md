
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Application state can be changed directly from actions
No reducer implementations needed nor action types needed.

Creates an immutable data structure.

Works with redux devtools

Has it's own redux-thunk like implementation
Recommended to use be used with react-redux:

Easy to work with deep structured state.

All changes are immutable.
Shape of the state can be extended and modified at anytime, ones root object of the data structure is defined at the at the start.

All regular Object and Arrays of the state is quite like it's own sub reducers.

imports
```
import { Provider, connect, } from 'react-redux';
import { createStore, applyMiddleware, } from 'redux';
import nonedux from 'none-dux';
```

init:
```
const initialState = {
  request: {},
  todosByUser: {},
  users: {},
};

const { reducer, thunk, dispatcher, } = nonedux(initialState, shape);
const createStoreWithMiddleware = applyMiddleware(...[ thunk, ])(createStore);
const store = createStoreWithMiddleware(reducer, window.devToolsExtension && window.devToolsExtension());

dispatcher(store); // don't for get this one

const root = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...

```
action creators:
```
//userActions

function createUser(userData){
  return function({users}){
     const id = uuid()
     const {[id]: newUser} = users.setState({[id]: {...userData, id}})
     // an action was created {type: 'SET_STATE', target: ['users'], param: {id, /*and reset of userData*/...}}
     // The the action was performed by the users reducer
     api.postUser(newUser.state)
      .then(...)
  }
}

function verifyUser(id)
  return function(store){
  const { state } = store.users[id].setState({verified: true});
  console.log(state.verified) // 'true'
  // action {type: 'SET_STATE', target: ['users', $id], param: {verified: true'} }
}

export function removeUser(userId) {
   return function ({users, todosByUser, }) {
    const user = users[userId];
    const usersTodos = todosByUser[userId]
    user.setState({ verified: false, });
    // an action was created {type: 'SET_STATE', target: ['users', $id], param: {verified: false'} }
    deleteUser(userId)
      .then(()=> {
        users.remove(userId);
        // action  {type: 'REMOVE', target: ['users'], param: [userId] }
        userTodos.removeSelf();
        // action  {type: 'REMOVE', target: ['todosByUser'], param: [userId] }        
      }); 
  }
}


//todoActions
export function toggleTodo(id,userId){
  return function(store){
    const todo = store.todosByUser[userId][id];
    const { state: {done}, } = todo;
    const { state, prevState, } = todo.setState({pending: true, done: !done});
    // action  {type: 'SET_STATE', target: ['todosByUser', userId, id ], param: {pending: true, done: !done}}
    updateTodo(id, state)
      .then(...)
  }
}


```

Other methods:
```
const ids = [1,2,3 ];
target.remove(...ids); //removes all children with matching ids
//same as target.remove(1,2,3);
target.removeSelf(); //remove self
```

State of the store is can be reformed at any time, but the top level objects have to be defined at start:
```
//in action creators action

const {parent} = store;
console.log(parent.state); // {}
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

```

```
Behavior of state can be misleading when using arrays because array state is not merged

const {misc} = store;
console.log(misc.state)              // [1, 2, 3]
misc.setState({a: 4, b: 5})          // state = {a: 4, b: 5}
misc.setState({b: 6, c: 7})          // state = {a: 4, b: 6, c: 7}
misc.setState([1, 2, 3]);            // state = [1, 2, 3]
misc.setState([4, 5]);               // state = [4, 5]
```
All parts of the store is its own substore. But only root store can be subscribed
<img width="1025" alt="screenshot" src="https://cloud.githubusercontent.com/assets/11061511/26591980/0a8fe422-4568-11e7-93cc-1d083640a6ca.png">

Adding new root level reducers to store after init it not supported yet. 
In the example image there is 2 root level reducers/sub-stores (Todos & something). How the change in their data structure is not limited.

Limitations:
 Every reducer needs to return an object:
  If string, number boolean, null etc. is returned that reducer will not work from that onward
 Every 'setState' 'remove', 'clearState' must be called to a child of root in actions:
  store.setState({something:{...}); will not cause any change


If you redux stack consists of redux, react-redux and redux-thunk (without custom middlewares) you can try out none-dux
```
Initialization:
  replace:
   
  import {createStore, applyMiddleware} from 'redux'
  import thunk from 'redux-thunk'
  
  const middleware = [ thunk, ];
  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
  const store = createStoreWithMiddleware(
    reducers, 
    process.env.NODE_ENV !=='production' && window.devToolsExtension && window.devToolsExtension()
  );
  
  <Provider ....
  
  by:  
  //Take the current initial state of from your reducers and use it as initialState
  import {createStore, applyMiddleware} from 'redux'
  import nonedux from 'none-dux'
  
  const { reducer, thunk, dispatcher, } = nonedux(initialState);
  const createStoreWithMiddleware = applyMiddleware(...[ thunk, ])(createStore);
  const store = createStoreWithMiddleware(
    reducer, 
    process.env.NODE_ENV !=='production' && window.devToolsExtension && window.devToolsExtension()
  );
  dispatcher(store);
  
  <Provider ....
  
********************’
  
Actions
 replace: 
 //actions redux-thunk
 function changeUserName(id, name){
    function(dispatch){
      dispatch({type: SET_USER_NAME, payload: {id, name}}) 
    }
 }
 
 
 
 
 //actions none-dux
 function changeUserName(id, name){
    function({users}){
      users[id].setState({name});
    }
 } 
```

if you have a big static data that will only be added, removed or replaced, for performance reasons you can boot performance like so:
```
import { createLeaf } from 'none-dux'

...

function fetchCustomerData(){
  function({statistics}){
    fetchUserData()
      .then(({data}) => {
        let { transactions, associations } = data;
        transactions = createLeaf(transactions);
        associations = createLeaf(associations);
        statistics.setState({transactions, associations}).
        //createLeaf works with both arrays and objects
      })
  }
}
```

if you want to add type checking add 'shape' as second argument for nonedux function call':
```
/*
The only effect is that you will get console warnings during development, when shape breaks specification.
*/
import nonedux, {shapes} from 'none-dux
const { spec, any, array, object, number, string, exclusive, isRequired, bool, } = shapes;

const shape = {
  todosByUser: { [spec]:{ object, isRequired, }, 
    [anyKey]: { [spec]: { object},                   // byUserIds 
        [anyKey]: { [spec]: { object, exclusive},    // byTodoIds.  'exclusive' console errors when values outside of spec are added
          userId: {[spec]: { string, isRequired, }, },  // 'isRequired' console errors when userId is not spesified in todo object
          id: { [spec]: { string, isRequired}, },
          description: { [spec]: { string, isRequired, }, },
          done: { [spec]: { bool, }, },
    },
  },
  users: { [spec]: { object, }, // by id
     [anyKey]: {
      id: { [spec]: { string, }, },
      firstName: { [spec]: { string, },
      lastName: { [spec]: { string, },     
    },
  },
  request: {[spec]: { object, isRequired}}
};
const initialState = {todosByUser: {}, users: {}, request: {}}};
const { reducer, thunk, dispatcher, } = nonedux(initialState, shape);

//... and the rest is the same
/*
using shape makes the performance significantly slower in dev environment
shape is ignored when NODE_ENV === 'production'

Shape validation should be moved to it's own package as a redux middleware later on

Currently when using 'shape' to evaluate state, values created using createLeaf are not evaluated.
*/
```


