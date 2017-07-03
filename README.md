
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Application state can be changed directly from actions.

All regular Object and Arrays of the nonedux state are quite like their own Component.

Action are auto generated and dispatched when functions **setState**, **clearState**, and **remove** are invoked.

Makes immutability easy and saves you the time of implementing maintaining and testing reducers.

Works with redux devtools.

Has it's own thunk implementation

Recommended to use be used with react-redux:

All changes are immutable.

Shape of the nonedux state can be extended and changed dynamically.

##Getting started

```
import { Provider, connect, } from 'react-redux';
import { createStore, applyMiddleware, } from 'redux';
import nonedux from 'none-dux';


const initialState = {
  request: {},
  todosByUser: {},  
  users: {},
};

const { reducer, thunk, dispatcher, } = nonedux(initialState);// use nonedux thunk instead of redux-thunk
const createStoreWithMiddleware = applyMiddleware(...[ thunk, ])(createStore);
const store = createStoreWithMiddleware(reducer, window.devToolsExtension && window.devToolsExtension());

dispatcher(store); // introduce store to none-dux, so it able to dispatch actions when needed

const root = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...
```
####action creators:
#####Second argument of actions is reduxStore (just in case if you have some non nonedux reducers)
```
//userActions
function createUser(userData){
  return function({users}, reduxStore){
     const id = uuid()
     const {[id]: newUser} = users.setState({[id]: {...userData, id}})
     // 1. an action was created {type: 'SET_STATE', target: ['users'], param: {id, /*and reset of userData*/...}}
     // 2. action was dispatched
     // 3. users reducer performed the actions
     // 4. setState method returned the very same users object
     api.postUser(newUser.state)
      .then(...)
  }
}

function verifyUser(id)
  return function(nonedux){
  const { state } = nonedux.users[id].setState({verified: true});
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
  return function(nonedux){
    const todo = nonedux.todosByUser[userId][id];
    const { state: {done}, } = todo;
    const { state, prevState, } = todo.setState({pending: true, done: !done});
    // action  {type: 'SET_STATE', target: ['todosByUser', userId, id ], param: {pending: true, done: !done}}
    updateTodo(id, state)
      .then(...)
  }
}
```

#####Other methods:
```
const ids = [1,2,3 ];
target.remove(ids); //removes all children with matching ids
// same as target.remove(1,2,3);
target.removeSelf(); //remove self
```


###State of the nonedux child object can be redefined at any time, but immediate childs of nonedux (top level values) have to be objects, and defined at the initialState:

 ####Initial state
 ```
 
const initialState = { 
       str: 'string',                        //invalid value!
       leaf: createLeaf({statistics: {...}}) //invalid value!
       empty: null,                          //invalid value!
       obj: {a:1}                            //valid
       arr: []                               //valid
       parent: {}                            //valid
     })}
 ```
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
 
 * **setState** and **clearState** take only objects and arrays as parameter:
  ```
  nonedux.data.setState('text'); //Error("['data'] Expected setState parameter to be an Object or Array, but got 'text'")
  ```
  
  
###Limitations:
  * Adding new root level values after init, is not possible:
      * instead you should init something like 'temp' object if you have changing data
   ```
   const initialState = {
     ...otherData,
     temp: {}     //used for forms etc.
   };
   ... // on enter form page
   temp.setState({userForm: {
      firstName: '', lastName: '', email: '' ...
   }})
   ... // on exit form page
   //dispose of non relevant data:
   temp.clearState({}) //state => {}
   
   ```
 * ***setState*** ***remove***, ***clearState*** can be called only by **children** of nonedux:
    
   ```
   nonedux.setState({something:{...}); //will not cause any changes
   ``` 
   instead 
   ```
   nonedux.something.setState(obj) //is fine
   ``` 
 
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
  
 * no multiple nonedux instances per application: 
   * Meaning that the application cannot have multiple react-redux Providers that both use different nonedux reducer at the same time
   
 


If you redux stack consists of redux, react-redux and redux-thunk you can try out none-dux with a few steps:

##Provider
###Replace
```
  import {createStore, applyMiddleware} from 'redux'
  import thunk from 'redux-thunk'
  
  const middleware = [ thunk, ];
  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
  const store = createStoreWithMiddleware(
    reducers, 
    process.env.NODE_ENV !=='production' && window.devToolsExtension && window.devToolsExtension()
  );
  
  <Provider store={store}> ... 
  
```
###By
```
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
  
  <Provider store={store}> ...   
  ```
  ##Actions
  ###Replace
  ```
 //actions redux-thunk
 function changeUserName(id, name){
    function(dispatch){
      dispatch({type: SET_USER_NAME, payload: {id, name}}) 
    }
 } 
  ```
  ###By
 ``` 
 //actions none-dux
 function changeUserName(id, name){
    function({users}){
      users[id].setState({name});
    }
 } 
```

if you have a big static data that will only be added, removed or replaced, you can save performance by creating 'leafs'':
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

if you want to add type checking use **shape** as second argument for nonedux function call':
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

/*
using shape makes the performance significantly slower in dev environment
shape is ignored when NODE_ENV === 'production'

Shape validation should be moved to it's own package as a redux middleware later on

Currently when using 'shape' to evaluate state, values created using createLeaf are not evaluated.
*/
```


