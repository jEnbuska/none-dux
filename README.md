
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Flexible state management for React

Creates a highly flexible top level reducer that takes care of immutability.

Application state can be changed directly from actions.
```
function myActionCreator(){
  return changeSomething(nonedux, reduxStore){
    const stateBefore = nonedux.state;
    console.log(stateBefore)// { change: { a: { child: { by: {calling: {}} } } } }
    const {state, prevState, subChild} = nonedux
      .change
      .a
      .child
      .by
      .calling.setState({ subChild: {wasCreated: 'now' } });
      
    console.log(prevState) // {}
    console.log(state); // { subChild: {wasCreated: 'now' } }
    console.log(stateBefore !== nonedux.state) // true
    
    subChild.setState({wasCreated: 'previously'})
    
  }
}
```
Shape of the nonedux state can be extended and changed dynamically.

Action are auto generated and dispatched when functions **setState**, **clearState**, and **remove** are invoked.

Makes immutability easy and saves you the time of implementing, maintaining and testing reducers.

Uses it's own thunk middleware


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

//Does NOT work with default 'redux-thunk'

const { reducer, thunk, dispatcher, } = nonedux(initialState);// use nonedux thunk instead of redux-thunk
const createStoreWithMiddleware = applyMiddleware(...[ thunk, ])(createStore);
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
     const {[id]: newUser} = users.setState({[id]: {...userData, id}})
     // 1. an action was created {type: 'NONE_DUX_SET_STATE', target: ['users'], param: {id, ... }}
     // 2. action was dispatched
     // 3. nonedux reducer performed the actions
     // 4. setState method returned the very same users object
     api.postUser(newUser.state)
      .then(...)
  }
}

function verifyUser(id)
  return function(nonedux){
  const { state } = nonedux.users[id].setState({verified: true});
  /*action {
    type: 'NONE_DUX_SET_STATE', 
    target: ['users', $id], 
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
Note that String, Booleans Numbers, Errors, Date, etc are under state
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
// setState keeps the outerjoin
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
// same as target.remove(1, 2, 3);
...

target.removeSelf(); //remove self
// same as target.getParent().remove(target.getId())
```


#####State of the nonedux child object can be redefined at any time:
```
function actionCreator(){
  return function(nonedux){
    const {parent} = nonedux;
    console.log(parent.state); // {}
    parent.setState({
          children: {
            firstSubChild: {
              role: 'first', children: false
            },
            secondSubChild: {
              role: 'second'
            }
         }
       });
    const {firstSubChild, secondSubChild} = parent.children;
    firstSubChild.removeSelf();
  }
}
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
      
     console.log(data.obj) //SubStore: ...
      
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
  //Take the current initial state of from your reducers and use it as initialState
  ...
  import nonedux from 'none-dux'
  
  //use nonedux thunk
  const { reducer, thunk, } = nonedux(initialState);
  const createStoreWithMiddleware = applyMiddleware(...[ thunk, ])(createStore);
  const store = createStoreWithMiddleware(reducer);
  
  <Provider store={store}> ...   
  ```
  ###2. Actions
  replace something like
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
----------------
And That should be done



##Judge non changing datas or objects that have circular structure

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
It's best to have only normalized state in application state

But if you have circular structures, react components or 3th party library objects like `moment`:s. in your state
,use 'createLeaf'.

Using custom JavaScript classes in nonedux reducer state is not well tested, but most likely they are changed into regular Objects without class spesific functions.

##Type checking

```
//The only effect is that you will get console warnings during development, when shape breaks specification.

import nonedux, { shape } from 'none-dux

const { reducer, thunk, subject, } = nonedux(initialState);

const { types, any, validatorMiddleware } = shape;
const { isRequired, strict string, bool } = types;

const validator = { ...isRequired.strict  //!!!Use destructed on Objects shape spesification
  todosByUser: { ...isRequired,           // Not null not undefined
    [any]: {                              // byUserIds 
      [any]: { ...strict,                 // byTodoIds.  'strict' console errors when values outside of spec are added
        userId: string.isRequired,        // No desctructing   
        id: string.isRequired,
        description: string.isRequired,
        done: bool,
    },
  },
  users: {  // by id
   [any]: {
    ...strict
    id: string,
    firstName: string,
    lastName: string,     
    },
  },
  
  //more
  someObjectList: [
    isRequired,         //!!!No desctructing
    {  //object shape
      a: number,
      b: {},            //Object that can include anything an is not required
    }
  ],
  someStringList: [ string ]
  request: {...isRequired}
};
```
If you do not have destructing available (with objects):
```
//instead of
{
  ...strict.isRequired
}
//do
const {spec} = shape;
{
 [spec]: isRequired.strict[types]
}
```
using shape makes the performance slower so check process.end.NODE_ENV before adding it as middleware


