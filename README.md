
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Flexible state management for React

Add on for react-redux 

Creates a highly flexible top level reducer that takes care of immutability.

Application state can be changed directly from actions.
```
function myActionCreator(){
  return changeSomething(nonedux, reduxStore){
    const stateBefore = nonedux.state;
    console.log(stateBefore)// { change: { child: { byCalling: {}} } } 
    const {state, prevState, subChild} = nonedux
      .change
      .child
      .byCalling.setState({ subChild: {wasCreated: 'now' } });
      
    console.log(prevState) // {}
    console.log(state); // { subChild: {wasCreated: 'now' } }
    console.log(stateBefore !== nonedux.state) // true
    
    //new state can be interracted with
    subChild.setState({wasCreated: 'previously'})
    
  }
}
```

Action are generated and dispatched when functions **setState**, **clearState**, and **remove** are invoked.

Makes immutability easy and saves the time of implementing, maintaining and testing reducers.

##Configuring store

```
import { Provider, connect, } from 'react-redux';
import { createStore, applyMiddleware, } from 'redux';
import nonedux from 'none-dux';


const initialState = {
  request: {},
  todosByUser: {},  
  users: {},
};

//does not work with redux thunk, because it does the same thing but differently
const { reducer, middlewares } = nonedux(initialState);
const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducer);

const root = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...
```
#####***setState*** ***remove***, ***clearState*** can be called to all objects and arrays from inside action creators:
##### Actual state of object is inside ***state*** variable
##Action examples

```
function createUser(userData){
  return function({users}, reduxStore){
     const id = uuid()
     users.setState({[id]: {...userData, id}})
     // 1. an action was created: {
        type: 'NONEDUX::SET_STATE', 
        NONEDUX::SUB_REDUCER: ['users'], 
        NONEDUX::PARAM: {id, ... }
      }
     // 2. action was dispatched
     // 3. nonedux reducer performed the actions
     api.postUser(users[id].state)
      .then(...)
  }
}

function verifyUser(id)
  return function(nonedux){
  const { state } = nonedux.users[id].setState({verified: true});
  /*action {
    type: 'NONEDUX::SET_STATE', 
    NONEDUX::SUB_REDUCER: ['users', $id], 
    param: { verified: true },
  }*/
  console.log(state.verified) // 'true'
}

export function removeUser(userId) {
   return function ({users, todosByUser}) {
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
```
String, Numbers, Date, etc. Can only be changed through parent object and accesses through parent state
```
console.log(target.state)// {value: 'text'};
console.log(target.value); //undefined
console.log(target.state.value); //'text'
```

##Functions

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
  
##Limitations:
 * ***setState*** ***remove***, ***clearState*** can be called to all objects and arrays:
 * Only objects and arrays can be referenced directly:
   ```
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
    

#####If you redux stack consists of redux, react-redux and redux-thunk you can try out none-dux with a few steps:
happy path: (assuming you do not have circular structures, custom Javascript classes or React.Components in our redux state)


####1. Initializing store
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
  ###2. Actions
  replace with something like
  ```
 //actions redux-thunk
 function changeUserName(id, name){
    function(dispatch){
      dispatch({type: SET_USER_NAME, payload: {id, name}}) 
    }
 } 
  ```
  By
 ``` 
 //actions none-dux
 function changeUserName(id, name){
    function({users}){
      users[id].setState({name});
    }
 } 
```
---------------



##Judge non changing data, or objects that with circular structure

if you have a lot of data data that will only be set, removed or replaced, you can increase performance by creating 'leafs'':
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
##Warning
It's best to use only normalized state, but if you have circular structures, react components or 3th party library objects like `moment`:s. in your state
,use 'createLeaf'.

Using custom JavaScript classes in nonedux reducer state is not well tested, but most likely they are changed into regular Objects without class specific functions.

##Type checking

```
//Provides console errors when something is not what it should have been.

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
      b: {},            //Object that can include anything an is not required
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


