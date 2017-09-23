
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Alternative for 'redux-thunk'
0 reducer boilerplate

Application state can be changed directly from actions creators

Action objects are auto generated and dispatched  when (***setState / clearState / remove***) functions are invoked

Immutability is taken care of by middlewares and published by child reducers

Reducers can be safely extended without any predefined shape.
```
function grow() {
  return function (nonedux) {
    console.log(nonedux.state); // {subState: {}}
    let child = nonedux.subState;
    [1,2,3].forEach(n => {
      child.setState({[n]: {}});
      child = child[n];
    })
    console.log(nonedux.state) // {subState: {1: {2: {3: {}}}}}
  };
}

function generateMessState(depth = 3, height = 0) {
  /* initialState = {mess: {}, ...}*/
  return function (nonedux, { dispatch, }) {
    const { mess, } = nonedux;
    let child = mess;
    for (let i = 0; i<depth && child; i++) {
      child = child.setState({ [height]: dispatch(generateMessState(i, i+1)) })[height]
    }
    return nonedux.mess.state;
  };
})
```
## Installation
```
npm install --save none-dux 
yarn add none-dux
```

## Configuring store
```
import { Provider, connect, } from 'react-redux';
import { createStore, applyMiddleware, combineReducers, } from 'redux';
import nonedux from 'none-dux';

const initialState = { //Sames as the initial state of store
  request: {},
  todosByUser: {},  
  users: {},
};

// don't add 'redux-thunk'
const { reducers, middlewares } = nonedux({ initialState });

// creates the reducers defined in initialState
console.log(Object.keys(reducers)); //['request', 'todosByUser', 'users']

const store = createStore(
  combineReducers({ ...reducers, }), // can be combined with other reducers like redux-form
  applyMiddleware(...middlewares)
);

const root = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        ...
```

## Action examples
##### ***setState*** ***remove***, ***clearState*** can be called to nonedux objects and arrays from inside action creators:
###### All Promises used inside Actions must be returned. Further details after next example
```
// actions 1st argument is nonedux reference, 2nd one is redux store
// they are injected to dispatched functions by nonedux thunk

export function removeUser(userId) {
   return function (nonedux, {dispatch}) {
       const {users, todosByUser} = nonedux;
       const user = users[userId];      
       user.setState({ verified: false, });
       //All promises must be returned
       return api.deleteUser(userId)
        .then(()=> {;
            users.remove(userId);
            todosByUser.remove(userId);
         });
    }
}
...

function createPayment(userId, data){
    return function({users, transactions}){  
    const user = users[userId];
    if(!user.state.pendingPayment){     
        user.setState({pendingPaymend: true})
        const id = uuid(); 
        const {[id]: transaction} = transactions[userId].setState({
            [id]: {id, ...data, userId, validated: false, }
        })     
        return api.postTransactions(transaction.state)
          .then(() => {
              transaction.setState({validated: true})
              user.setState({pendingPayment: false})
          })
          .catch(err => { ... })
        }
    }
}
```
# Important detail about Actions
All promises must be returned from Actions, otherwise changing app state after promise will throw error. 
Alternative use async await and call await to all promises. 
```


function returnPromisesAsynAwait() {
    return async function ({ data, notifications, }) {
        notifications.setState({ dataFetch: 'pending', });
        try {
            const dataResult = await api.fetchData();
            data.setState(dataResult.data);
            notifications.setState({ dataFetch: 'success', });
            await sleep();
            notifications.setState({ dataFetch: '', })
        } catch (e) {
            notifications.setState({ dataFetch: 'error', });
            await sleep();
            notifications.setState({ dataFetch: '', });
        }
    };
}

function returnPromisesTraditional() {
  return function ({ data, notifications, }) {
    notifications.setState({ dataFetch: 'pending', });
    return api.fetchData() // return Promise                         
      .then((result) => {
        data.setState(result.data);
        notifications.setState({ dataFetch: 'success', });
        return sleep() // return Promise                             
          .then(() => notifications.setState({ dataFetch: '', }))
      }).catch(() => {
        notifications.setState({ dataFetch: 'error', });
        return sleep()  // return Promise
          .then(() => notifications.setState({ dataFetch: '', }))
      });
  };
}

```

## Functions
##### Calling functions like ***setState*** returns the same instance
```
const {child} = nonedux;
child.setState({subChild: {}}).subChild.setState({noChild: null})

console.log(child.state); 
// { child: { subChild: { noChild: null} } }
```

##### setState
```
console.log(target.state); // { a: 1, b: {} }

// setState does shallow merge
target.setState({ a: 2, c: 3 });
console.log(target.state) // { a: 2, b: {}, c: 3 }

// setState takes Objects as parameters
target.setState('test'); //Error("[...]")
target.setState([ 1, 'abc', {} ]); //Error("[...]")
```
 
##### clearState
```
 console.log(target.state); //{ a: 1, b: { } }
 
 // clear state removes the previous states outer join
 target.clearState({ b: 2 });
 console.log(target.state); // { b: 2 }
 
// clearState takes both Object or Array as parameter
 target.setState('text'); //Error("[...]")
```
#### remove
```
const keys = [ 1, 2, 3 ];

target.remove(keys); //removes all children with matching keys
//same as
target.remove(1,2,3);
//or
target.remove(...[1,2,3]);
```

## State
**Root level** state variables must be defined at nonedux initialState

***Leaf*** values like String, Numbers, Date, etc. Can only be changed through parent Object/Array and used through parents ***state***
```
{
  console.log(target.state)// { name: 'text' };
  console.log(target.name); //undefined
  console.log(target.state.name); //'text'
}
...
{
  const {data} = nonedux.data.setState({ str: 'abc' });
  
  console.log(data.str); // undefined
   
  console.log(data.str.state); // throws Error(...)
   
  console.log(data.state.str); // 'abc'
}
...
{
  const { data } = nonedux.data.setState({ obj: { str: 'ok' } })
   
  console.log(data.obj) //Branch: ...
   
  console.log(data.obj.state) // { str: 'ok' }
}
```
### If you redux stack consists of redux, react-redux and redux-thunk you can try out none-dux with a few steps:

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
  
  // ( Do not use 'redux-thunk' )
  const { reducers, middlewares, } = nonedux({ initialState });
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(combineReducers({...reducers}));
  
  <Provider store={store}> ...   
  ```
  
#### 2. Actions

replace with something like
  ```
 //actions redux-thunk
 function updateUser(id, changes){
    return function(dispatch){
      dispatch({type: UPDATE_USER, payload: {id, ...changes}}) 
    }
 } 
  ```
  By
 ``` 
 //actions nonedux
 function updateUser(id, changes){
    return function({users}){
      users[id].setState(changes);
    }
 } 
```

## Optional type checking

### Type checking is only intended for development and does not work on old browsers
#### It provides console errors when something breaks specifications.
##### Step 1. Adding shape validator as middleware
```
import nonedux, { shape } from 'none-dux
import validator from './validator'
... 

const { reducer, middlewares, subject, } = nonedux({ initialState });
const createStoreWithMiddleware = applyMiddleware(...middlewares, shape.validatorMiddleware(subject, validators))(createStore);
const store = createStoreWithMiddleware(combineReducers({ ...reducers, })
...
```
##### Step 2. Creating validator
```
const { types, any, validatorMiddleware } = shape;
const { isRequired, strict, string, number, bool } = types;

const validator = {
  ...isRequired.strict,  // ! Use destructed when you have Objects shape spesification
  todosByUser: {
    ...isRequired,           // Not null nor undefined
    [any]: {                              // byUserIds
      [any]: {
        ...strict,                 // byTodoIds.  'strict' console errors when values outside of spec are added
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
        ...string.many('id',
          'firstName',
          'lastName')
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
    someStringList: [ string ],
    request: { ...isRequired },
  }
};
```
###### Few key details about type checking that are easy to miss
```
//Object shape

Will work:
{ ...isRequired }
{ ...strict }
{ ...strict.isRequired }
{ ...isRequired.strict }
{ isRequired: string } //Assumed key name is actually 'isRequired'!

Won't work:
{ strict }
{ isRequired }

//Array shape
 
Will work:
[ strict, {} ]
[ isRequired, number ]
[ strict.isRequired, {...isRequired} ]  //array with not-null/undefined objects
[ isRequired.strict, [] ]               //array that has arrays

Won't work
[ ...isRequired, number ]
[ ...strict, {} ]
[ ...strict.isRequired ]
[ ...isRequired.strict, [] ]

// 'any' key

Will work:
{ [any]: number, myObj: {} } //assumes that values is number is name is not 'myObj'
{ [any]: {} }
{ any: string, } //means that the key name is actually 'any'

Wont work:
{ [any]: any, }     //any is not type but identifier
{ something: any }  //same here
```
###### Using shape makes the performance slower so check process.end.NODE_ENV before adding it as middleware

----------------
## Atomic changes
##### Transaction allows doing multiple changes before store gets the updated state
```

/* in action creator */
// Store state = { users: {} }

*TRANSACTION*

function playWithTransaction(){
  return function(nonedux){
    nonedux.transaction(({ users }) => {
      users.setState({ a:{}, b: {} })
      users.setState({ c:{} })
      users.c.setState({ todos:{} })
    }) // --> update store state
  }
}

*SIMPLE ROLLBACK*
function playWithRollback(){
  return function(nonedux){    
    nonedux.transaction(({ users }) => {
      users.setState({ a:{}, b: {} })
      users.setState({ c:{} })
      nonedux.c.setState({ todos:{} })
      throw new Error();    // ROLLBACK ALL
    }) // --> no published changes
  }
}

*ADVANCED ROLLBACK*
function rollbackAdvanced(){
  return function(nonedux, {dispatch}){    
    nonedux.transaction(({ users }) => {
      users.setState({ a:{} })
      try{
        dispatch(doChangesAndThrowError());
      }catch(ignore){ /* explicitly thrown error */ }
    }) // --> state = { users: { a: {} } }
  }
}

function doChangesAndThrowError(){
  return function(nonedux){
     nonedux.transaction(({ users }) => {
        users.a.setState({ todos: {} })
        users.a.transaction(({ todos }) => {
          const id = uuid();
          todos.setState({[id]: id, done: false, description: 'Buy milk'})
        }) // --> rollback scopes changes
     })
  }
}
```
## Arrays
Arrays are not shallow merged like objects

'setState' and 'remove' can be expensive if run on older browsers, that do not support es6 Proxy

The technical details about why this is so, boils down to same reasons, why React is advices to not use index as 'key':s for component when creating list of components


## Performance

Depending of use case, with **old browsers** the performance **can** be ~5 times slower than with redux
##### 1. Avoid looping through hundreds of variables in nonedux variables
```
// Max time usually represents the time, operation takes on legacy browsers
// Bench marking done on MacBook Pro with i7 cpu
function removeRetiringEmployees(){
  return function(nonedux){
    const {employees} = nonedux;
    Object.keys(employees.state)
      .map(k => employees[k]) 
      // access single CHILD takes avg 0.005 - 0.02 ms
      .filter(employee => employee.state.age>=64) 
      // access to single STATE takes avg 0.002 - 0.04 ms
      .forEach(employee => employees.remove(employee.getId()));
      // single object REMOVE takes avg 0.1 - 0.3 ms
  }
}

function removeRetiringEmployee_better(){
  return function({employees}){            
    const retiringEmployees = Object.entries(employees.state)
      .filter(([k, employeeState])=> employeeState.age>=64)     
      .map(([k]) => k);
    employees.remove(retiringEmployees);
  }
}

function fetchEmployees(){
  return function({employees}){            
    return api.fetchEmployees(({data}) => {
      employees.setState(data);
      // assuming there is entries 1000 and every empty on data is object
      // takes about 0.75ms on modern browser
      // on legacy browser <7ms 
    })
  }
}

function fetchEmployees_better(){
  return function(nonedux){         
    return api.fetchEmployees(({data}) => {
      nonedux.setState({employees: data});
      // assuming there is entries 1000 and every empty on data is object
      // in avg good case takes about 0.1ms on modern browser
      // good case on legacy browser <7ms
      // on legacy browser 18ms 
    })
  }
}
```
**In some cases, when changing an array state that has Objects or other Arrays as children can be several times more inefficient compared to using objects**

## Leaf types:
Leafs are types that do not have children, nor they cannot be referenced directly but only through state
```
...
const {child} = nonedux;
child.clearState({
  numb: 1, str: 'abc', 
  err: new Error(), date: Date.now(), 
  regexp: /nonedux/,
  bool: false,
  func: () => console.log('im a function')
  arrLeaf = createLeaf([ 1, {}, [] ]),
  objLeaf = createLeaf({ a:1, b: {}, c[] })
})
const { ...childsChildren } = child;
Object.keys(childsChildren).length;   // 0
Object.keys(child.state).length;      // 7
Object.getPrototypeOf(child.state.arrLeaf).constructor.name // ArrayLeaf
Object.getPrototypeOf(child.state.objLeaf).constructor.name // ObjectLeaf
...
```
#### Defining leaf types
```
import { leafs } from 'none-dux'

leafs.MyClass = true;

...

nonedux.subState.setState({child: new MyClass()};)
nonedux.subState.child; //undefined
nonedux.subState.state.child; // MyClass...
```

--------------
## Warnings
#### 1. If you consider using none-dux in production
Note that performance is not great on old browsers. This should not be an issue unless someone is using and old IPhone or Windows Phone and you are doing a lot of animations.

#### 2. All keys must be strings or numbers
```
const key = () => console.log('I'm key');
target.setState({[key]: {} }) // This will result in bugs
```

#### 3. nonedux values are not enumerable
```
const {a, b, ...rest} = target.setState({ a:{}, b: {}, c: {}, d: {} })
Object.keys(rest).length  // 0

for(const child in target){
  console.log('This will never be executed')
}
```

##### Accessing all children
```
target.setState({ a:{}, b: {}, c: {}, d: {} })
const {a, b, ...rest} = target.getChildren()
Object.keys(rest).length  // 2

//or

const {state} = target.setState({ a:{}, b: {}, c: {}, d: {} })
const children = Object.keys(state).map(k => targe[k]);
```
###### Accessing all children could be inefficient. Do it only with small sets of objects

#### 4. Using custom non-leaf JavaScript classes in reducer state is not well tested

#### 5. Using non normalized state is not a must but recommended

#### 6. Comparison instances
```
// In modern browsers next evaluates to false
target.setState({a: {}})
target.a === target.a
// in old browsers the same evaluates to true
```

#### 6. There is grey areas with **Arrays that contain other Objects/Arrays**
```
const first = {a:1}, second = {b:2}, third = {c:3}
target.clearState([ first, second, third, ]);
const { 0: firstChild, 1: secondChild, 2: thirdChild, } = target;
target.clearState([ third, first, second, ]);  //switch order

/* One might expect that 'firstChild' state, 
would still points to 'first' value but it doesn't */
firstChild.state; // { c: 3, };
secondChild.state; // { a: 1, };
thirdChild.state; // { b: 2, };

//From 'clearState:s' point of view the previous means:
`target.clearState({0: first, 1: second, 2: third })`
```


## Older browsers
When nonedux code is run on browsers that do not support **es6 Proxy** the internal logic is implemented differently

###### Next performance improvement examples and warnings, apply only to older browsers
With large objects & arrays that include thousands of child objects the performance can be poor.

When accessing data from actions this is roughly what happens:
###### applies only to old browsers
```
function juggle(){
  return function(nonedux){
    nonedux.state // { obj: { primitive: 1, subChild: {} } }
    const obj = nonedux.obj 
    // nonedux --> get() { return child['obj'] || child['obj'] = createBranch('obj') }
        // obj -->  createGetterFor('subChild')
  }
}
```
###### applies only to old browsers
... when data is not referenced no work is done.

If objects children are **leafs**: (string,  numbers, etc.) there should not any performance problems

To improve performance Objects and Arrays can be wrapped as **leafs** by using **createLeaf** helper function.
###### applies only to old browsers
```
import {createLeaf} from 'none-dux'

function fetchCustomerData_Lightweight(){
  return function(nonedux){
    fetchUserData()
      .then(({data}) => {
        let { transactions, associations } = data;
        
        transactions = createLeaf(transactions);
        associations = createLeaf(associations)
        
        const {statistics} = nonedux;
        statistics.setState({transactions, associations}). //no direct refence to children;
        
        statistics.transactions //undefined
        statistics.associations //undefined
        statistics.state.transactions // is defined
        statistics.state.associations  // is defined
      })
  }
}
```
-------------------
## Changes v10->v11
The key differences compared to v10 is that the performance is 1-10 better in most heavies cases when run on modern browsers

Better support for older browsers

createLeaf has become obsolete (when not used in old browsers)

When used in old browsers 'legacy' (v10) mode will be used, because Proxy features cannot be added using babel

Table of Proxy support can be found at:
https://kangax.github.io/compat-table/es6/

#### Some breaking change:

##### 1. function 'removeSelf' has been removed

##### 2. initializing store
###### old:
```
const {subject, middlewares} = nonedux(initialState, bool /*flag for saga usage*/)
```
###### new:
```
//constructor parameters is an Object
const {subject, middlewares} = nonedux({
    initialState, 
    saga:bool, //optional 
    legacy: bool //optional --> if not defined, it will be automatically use legacy when run on a oldbrowser
})
```
##### 3. children are not enumerable
```
const {a, b, ...rest} = target.setState({ a:{}, b: {}, c: {}, d: {} })
Object.keys(rest).length  // 0

for(const child in target){
  console.log('This will never be executed')
}
```
##### 4. function getChildren return an Object instead of Array
```
const {a, b, ...rest} = target.getChildren()
Object.keys(rest).length  // 2
//or as Array
const {state} = target.setState({ a:{}, b: {}, c: {}, d: {} })
const children = Object.keys(state).map(k => targe[k]);
```
##### 4. No references are stored, when modern browsers are used. This makes almost everything bizillion times faster
```
target.setState({ a:{} });
target.a // instance created
target.a // instance created again
target.a === target.a // false
target.a.state === target.a.state; // true
```
###### Tested on latest chrome & IE10
#### Please submit reports to https://github.com/jEnbuska/none-dux/issues


