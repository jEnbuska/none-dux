
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Small sized React-redux extension that makes state management more flexible

Less verbose alternative for 'react-redux + redux-thunk' stack

Application state can be changed directly from actions.

0 reducer boilerplate.

No external dependencies

peerDependencies: { redux, react-redux },

Action objects are auto generated and dispatched  when (***setState / clearState / remove***) functions are invoked.

Creates a flexible top level reducer that takes care of immutability.

State can be safely extended without any predefined shape
```
function grow() {
  return function (nonedux) {
    console.log(nonedux.state); // {}
    let child = nonedux;
    [1,2,3].forEach(n => {
      child.setState({[n]: {}});
      child = child[n];
    })
    console.log(nonedux.state) // {1: {2: {3: {}}}}
  };
}
function generateMessState(depth = 3, height = 0) {
  return function (nonedux, { dispatch, }) {
    const { mess, } = nonedux;
    let child = mess || nonedux.setState({ mess: {}, }).mess;
    for (let i = 0; i<depth && child; i++) {
      child = child.setState({ [height]: dispatch(generateMessState(i, index+1)) })[height]
    }
    return nonedux.mess.state;
  };
})
```
## Configuring store
```
import { Provider, connect, } from 'react-redux';
import { createStore, applyMiddleware, } from 'redux';
import nonedux from 'none-dux';


const initialState = { //Sames as the initial state of store
  request: {},
  todosByUser: {},  
  users: {},
};

// don't add 'redux-thunk'
const { reducer, middlewares } = nonedux(initialState);
const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducer);

const root = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...
```
##### ***setState*** ***remove***, ***clearState*** can be called to nonedux objects and arrays from inside action creators:
##### Actual state of object is inside lazy ***state*** variable

## Action examples

```
// 1st argument is nonedux state reference, 2nd one is redux store
export function removeUser(userId) {
   //users & todosByUser are created lazily first time they are referenced
   return function ({users, todosByUser}, {dispatch}) {
    const user = users[userId];
    const usersTodos = todosByUser[userId]
    user.setState({ verified: false, });
    api.deleteUser(userId)
      .then(()=> {
        users.remove(userId);
        userTodos.removeSelf();        
      }); 
  }
}

function createTransaction(userId, data){
  return function({users, transactions}){
  const user = users[userId];
  if(!user.state.pendingPayment){
     user.setState({pendingPaymend: true})
     const id = = generateId(); 
     const {[id]: transaction} = transactions[userId].setState({[id]: {id, ...data, userId, validated: false, }})
     api.postTransactions(transaction.state)
      .then(() => transaction.setState({validated: true}))
      .then(() => user.setState({pendingPayment: false}))
      .catch(err => { ... })
    }
  }
}
```
String, Numbers, Date, etc. Can only be changed through parent object and used through parents ***state***
```
console.log(target.state)// {value: 'text'};
console.log(target.value); //undefined
console.log(target.state.value); //'text'
...
{
  const {data} = nonedux.data.setState({str:'abc'});
  
  console.log(data.str); // undefined
   
  console.log(data.str.state); // throws Error(...)
   
  console.log(data.state.str); // 'abc'
}
...
{
  const { data } = nonedux.data.setState({obj: {str: 'ok'}})
   
  console.log(data.obj) //StateMapper: ...
   
  console.log(data.obj.state) // {str: 'ok'}
}
```

## Functions

```
console.log(target.state); // { a: 1, b: {} }
target.setState({ a: 2, c: 3 });
console.log(target.state) // { a: 2, b: {}, c: 3 }
// setState does shallow merge
 ... 
 
 //clear state removes the outer join of the state
 console.log(target.state); //{ a: 1, b: { } }
 target.clearState({ b: 2 });
 console.log(target.state); // { b: 2 }
 
 // Both clearState and setState take object or array as parameter
 target.setState('text'); //Error("[..., 'target'] Expected setState parameter to be an Object or Array, but got 'text'")
...

const ids = [ 1, 2, 3 ];

target.remove(ids); //removes all children with matching ids
or
target.remove(1,2,3);
or
target[1].removeSelf();
target[2].removeSelf();
target[3].removeSelf();
```

##### If you redux stack consists of redux, react-redux and redux-thunk you can try out none-dux with a few steps:
happy path:


#### 1. Initializing store
replace
```
  ...
  import thunk from 'redux-thunk'
  
  const middlewares = [ thunk, ];
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(reducers);
  
  <Provider store={store}> ... 
  
```
by
```
  // Take the current initial state of from your reducers and use it as initialState
  
  ...
  import nonedux from 'none-dux'
  
  // (Do not use 'redux-thunk')
  const { reducer, middlewares, } = nonedux(initialState);
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(reducer);
  
  <Provider store={store}> ...   
  ```
  ### 2. Actions
  replace with something like
  ```
 //actions redux-thunk
 function updateUser(id, changes){
    function(dispatch){
      dispatch({type: UPDATE_USER, payload: {id, ...changes}}) 
    }
 } 
  ```
  By
 ``` 
 //actions nonedux
 function updateUser(id, changes){
    function({users}){
      users[id].setState(changes);
    }
 } 
```
---------------



## Large non changing objects

Children are created until they are referenced for the first time, so dumping a big non changing object to you state should not cause any overhead
```
...
function fetchCustomerData(){
  function({statistics}){
    //if children are not accessed previously they are created first time the are accessed
    fetchUserData()
      .then(({data}) => {
        let { transactions, associations } = data;
        statistics.setState({transactions, associations}). //no children created;
        const {transactions: t, associations: s} = statistics; // children 'transaction' & 'associations' were created        
      })
  }
}
```
### Warnings
Using custom JavaScript classes in reducer state is not well tested.
Using non normalized state is not a must but recommended

## Atomic changes
```
...
/*in index.js/jsx after store created*/
const states = new Set();
states.add(store.getState()); //initialState is `{}`
store.subscribe(() => states(store.getState()))
export getDistinctStates= () => states;
...
/*in action creator*/

*TRANSACTION*
function playWithTransaction(){
  function(nonedux){
    const state = nonedux.state;
    nonedux.transaction(() => {
      nonedux.setState({a:{}, b: {}})
      nonedux.setState({c:{}})
      nonedux.c.setState({d:{}})
    })
    const states = [...getDistinctStates()]
    console.log(states[0]);// {}
    console.log(states[1]); // {a: {}, b: {}, c: {d: {}}}
  }
}

*SIMPLE ROLLBACK*
function playWithRollback(){
  function(nonedux){
    const state = nonedux.state;
    nonedux.transaction(() => {
      nonedux.setState({a:{}, b: {}})
      nonedux.setState({c:{}})
      nonedux.c.setState({d:{}})
      throw new Error(); // rollback all
    })
    const states = [...getDistinctStates()]
    console.log(states[0]);// {}
    console.log(states.length) // 1
  }
}

*ADVANCED ROLLBACK*
function rollbackAdvanced(){
  function(nonedux, {dispatch}){
    const state = nonedux.state;
    nonedux.transaction(() => {
      nonedux.setState({a:{}}) // this change will not be cancelled because of try catch
      try{
        dispatch(doChangesAndThrowError());
      }catch(ignore){ /* explicitly thrown error */ }
    })
    const states = [...getDistinctStates()]
    console.log(states[0]);// {}
    console.log(states[1]); // {a: 1}
  }
}

function doChangesAndThrowError(){
  function(nonedux){
     nonedux.transaction(({a}) => {
        const orgState = nonedux.state //{a:1} 
        a.setState({b: {c: { } } })
        b.transaction(({c}) => {
          c.setState({d: 1})
          throw new Error('state should be returned to orgState')
        })
     })
  }
}
```

####State
```
function stateExample(){
  function(nonedux){
     nonedux.setState({a: {b: {c: {} } } } )
     const {b} = nonedux.a;
     const {c} = b;
     
     //by calling state (getter)
     const orgState = c.state
     //an action will be dispatched and returned `{ return dispatch({type: [GET_STATE], [TARGET]: ['a', 'b', 'c' ]})}`
     
     //If other branch of the object is mutated
     b.setState({d: {}})
     
     //... then states will not change due to path copying
     expect(orgState).toBe(c.state);
     
     //After remove
     c.removeSelf();
     c.state; // causes console error;
     c.setState({}) // throws Error
  }
}
```

## Type checking

```
//Provides console errors when something breaks spesifications.

import nonedux, { shape } from 'none-dux

const { reducer, middlewares, subject, } = nonedux(initialState);

const { types, any, validatorMiddleware } = shape;
const { isRequired, strict string, bool } = types;

const validator = { ...isRequired.strict  // ! Use destructed when you have Objects shape spesification
  todosByUser: { ...isRequired,           // Not null not undefined
    [any]: {                              // byUserIds 
      [any]: { ...strict,                 // byTodoIds.  'strict' console errors when values outside of spec are added
        userId: string.isRequired,        // ! No desctructing   
        id: string.isRequired,
        description: string.isRequired,
        done: bool,
    },
  },
  users: {  // by id
   [any]: {
    ...strict,
    //one liner for creating multiple keys with same spec
    ...string.many('id', 'firstName', 'lastName')  
    },
  },
  
  //more examples
  someObjectList: [
    isRequired,         // ! No desctructing
    {
      a: number,
      b: {},            // Object that can include anything an is not required
    }
  ],
  someStringList: [ string ]
  request: {...isRequired}
};
```
If you do not have object spread available (with objects shape):
```
//instead of
{
  ...strict.isRequired
}
//do
const {spec} = shape;
{
 [spec]: isRequired.strict[spec]
}
```
using shape makes the performance slower so check process.end.NODE_ENV before adding it as middleware


