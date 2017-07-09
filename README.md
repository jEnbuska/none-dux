
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Small sized React-redux extension that makes state management more flexible

Application state can be changed directly from actions.

No reducer boilerplate.

No external dependencies
peerDependencies: { redux, react-redux },

Action objects are auto generated and dispatched  when (***setState / clearState / remove***) functions are invoked.

Creates a flexible top level reducer that takes care of immutability.

State can be safely extended without any preset shape
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


const initialState = { //Sames as the initial state of reducers
  request: {},
  todosByUser: {},  
  users: {},
};

// don't use 'redux-thunk'
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
##### Actual state of object is inside ***state*** variable

## Action examples

```
// first argument is nonedux root reducer, second one is redux store
export function removeUser(userId) {
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
   
  console.log(data.obj) //AutoReducer: ...
   
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
happy path: (assuming you do not have circular structures, custom Javascript classes or React.Components in our redux state)


#### 1. Initializing store
replace
```
  ...
  import thunk from 'redux-thunk'
  
  const middleware = [ thunk, ];
  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
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

if you have data that will only be set, removed or replaced, you can increase performance by creating 'leafs'':
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
        //objects are created only in state
        //createLeaf works with both arrays and objects
        console.log(statistics.transactions) //undefined
        console.log(statistics.state.transactions !== undefined); // true  
      })
  }
}
```
### Warnings
If your state has circular structures, react components or 3th party library objects like `moment`:s, then use 'createLeaf' to avoid those objects being destructed recursively.

Using custom JavaScript classes in reducer state is not well tested.

##### Objects available in action creators do not actually hold any state they are just objects with meta data
###### That way functions like setState etc. are ~2x faster that they would be with internal state
```

function removeAndAddBack(){
  function(nonedux}){
    const {a} = nonedux.setState({a:{b: 1 }})
    console.log(a.getIdentity()); // ['a']
    nonedux.remove('a');
    console.log(a.state) // undefined
    // What actually happens when state is asked is 'return dispatch({type: GET_STATE, [SUB_REDUCER]: ['a]})'
    nonedux.setState({a: {b: 1}})
    console.log(a.state) // {b: 1}
    console.log(a===nonedux.a) // false
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
If you do not have destructing available (with objects specs):
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


