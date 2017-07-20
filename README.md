
![none-dux_sauli1](https://cloud.githubusercontent.com/assets/11061511/26650375/de9cf298-4651-11e7-9af2-b71a51db3e95.jpg)

Small sized React-redux extension, that opens a possibility to remove the most of redux boilerplate

Alternative for 'react-redux + redux-thunk' stack

Can also be used with redux-saga, to remove all **reducer boilerplate**: (No documentation: See examples/sagaExample. Some best practice guidelines should be decided)

Application state can be changed directly from actions.

0 reducer boilerplate.

No external dependencies

peerDependencies: redux  and react-redux

Action objects are auto generated and dispatched  when (***setState / clearState / remove***) functions are invoked.

Immutability is taken care of by middlewares and published by child reducers

State can be safely extended without any predefined shape
```
function grow() {
  return function (nonedux) {
    console.log(nonedux.state); // {someSubState: {}}
    let child = nonedux.someSubState;
    [1,2,3].forEach(n => {
      child.setState({[n]: {}});
      child = child[n];
    })
    console.log(nonedux.state) // {someSubState: {1: {2: {3: {}}}}}
  };
}
function generateMessState(depth = 3, height = 0) {
  return function (nonedux, { dispatch, }) { 
    /* initialState = {mess: {}, ...}*/
    const { mess, } = nonedux;
    let child = mess;
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
import { createStore, applyMiddleware, combineReducers, } from 'redux';
import nonedux from 'none-dux';


const initialState = { //Sames as the initial state of store
  request: {},
  todosByUser: {},  
  users: {},
};

// don't add 'redux-thunk'
const { reducers, middlewares } = nonedux(initialState);
console.log(Object.keys(reducers)); //['request', 'todosByUser', 'users']
const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(comboneReducers({...reducers})); // can be combined with other reducers like redux-form

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
   return function (nonedux, {dispatch}) {
      const {users, todosByUser} = nonedux;
      //users & todosByUser are created lazily first time they are referenced
      
      const user = users[userId]; //lazy
      const usersTodos = todosByUser[userId] //lazy
      
      user.setState({ verified: false, });
      
      api.deleteUser(userId)
        .then(()=> {
          users.remove(userId);
          userTodos.removeSelf();
        });
    }
}

function createPayment(userId, data){
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

export function removeUserTransactional(userId) {
   return function (nonedux, {dispatch}) {
      const {users, todosByUser} = nonedux;
      const user = users[userId];
      const usersTodos = todosByUser[userId]
      
      user.setState({ verified: false, });
      
      api.deleteUser(userId)
        .then(()=> {
          nonedux.transaction(() => { // only 1 update to store, if one of them fails both changes are cancelled
            users.remove(userId);
            userTodos.removeSelf();
          })
        });
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
 
 //clear state removes the previous states outer join
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

##State
**Root level** reducer variables must be defined at nonedux initialState

<sub>...  the types can be changed</sub>

```
function stateExample(){
  function(nonedux){
     console.log(nonedux.state)//{a: {}}
     nonedux.setState({a:1})
     nonedux.setState({a: 'hello none-dux'})
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
     
     nonedux.remove('a'); // Don't do this
     nonedux.clearState({b: {}}) //Don't do this either
  }
}
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
  const { reducers, middlewares, } = nonedux(initialState);
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(combineReducers({...reducers}));
  
  <Provider store={store}> ...   
  ```
  
#### 2. Actions

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
##### Few key details about type checking that are easy to miss
```
//Object shape

Won't work::
{ strict }
{ isRequired }

Will work:
{ ...isRequired }
{ ...strict }
{ ...strict.isRequired }
{ ...isRequired.strict }
{ isRequired: string } //Assuming key name is actually 'isRequired'

//Array shape
 
Won't work
[ ...isRequired, number ]
[ ...strict, {} ]
[ ...strict.isRequired ]
[ ...isRequired.strict, [] ]

Will work:
[ strict, {}]
[ isRequired, number ]
[ strict.isRequired, {...isRequired} ]
[ isRequired.strict, [] ]

any
Will work:
{ [any]: number, something: {} } //uses spec object if key is something else uses spec number
{ [any]: {} }
{ any: string, } //means that the key name is actually 'any'

Wont work:

{ [any]: any, } //any is not type but identifier
{ something: any } //same here

```

If you do not have object spread available (with 'objects' shape):
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

----------------
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
##Arrays
Arrays are not shallow merged like objects
```
myArray.setState([1, {}, 'str'])
//results to same as
myArray.clearState([1, {}, 'str'])
```
Having **arrays that have objects or other arrays as children** can make it very **inefficient** to perform updates

This is pretty much the same reason, why React is advices to not use index as 'key':s for component when creating list of components


## Performance

If you have an Object with thousands of Object entries and you are looping through them in an action, avoid the following 2 first patterns:

```
cosnt {values} = Object;

function removeOldEntries_worstPerformance(){
  return function({bigData}){
    const {...dataEntries} = bigData;               //force init every non lazy child
    const shouldBeRemoved = (entry) => entry.date < Date.now()
    values(dataEntries)
      .filter((e) => shouldBeRemoved(e.state))      // get every value separatelly (this is quite fast) 
      .forEach(e => e.removeSelf())                 // remove each separatelly
      
     //If there was 5000 entries and all of them where removed, the whole operation could take > 1500ms on macbook pro
  }
}
...

//Note that if entries are not Objects/Arrays no performance optimization needed

cosnt {entries} = Object;

function removeOldEntries_semiPerformance(){
  return function({bigData}){
    const {state} = bigData;                           //ask state only ones
    const shouldBeRemoved = ([k, value]) => value.date < Date.now()
    const oldEntries = entries(state)
      .filter(shouldBeRemoved)                         // use plain object state
      .map(([k])=> k)                                  // select keys
      bigData.remove(oldEntries);                      // remove all at ones
      
     //This should be about 60x faster.
  }
}
...

cosnt {entries, assign} = Object;

// Assuming bigData children are created by 'createLeaf' (see next section about 'Large objects'):
/*
  const bidDataContent = entries(data).reduce((acc, [k, v]) => assign(acc, {[k]: createLeaf(v) }), {})
  nonedux.bigData.setState(bigDataContent)
*/

function removeOldEntries_goodPerformance(){
  return function({bigData}){
    const {state} = bigData;
    const shouldBeRemoved = ([k, value]) => value.date < Date.now()
    const oldEntries = entries(state)
      .filter(shouldBeRemoved)                         // use plain object state
      .map(([k])=> k)                                  // select keys
      
      bigData.remove(oldEntries);                      // remove all at ones
      
     //This should be about 160x faster than slowest.
  }
}
...
import {createLeaf} from 'none-dux'

cosnt {entries, assign} = Object;

// Assuming bigData is created by 'createLeaf' (see section about 'Very large objects'):
// nonedux.setState({bigData: createLeaf(data)})

function removeOldEntries_bestPerformance(){
  return function(nonedux){
    const {bigData} = nonedux.state;    
    const shouldBeKept = ([k, value]) => value.date >= Date.now()
    const nextBigData = entries(bigData)
      .filter(shouldBeKept)                        
      .reduce((acc, [k, v]) => assign(acc, {[k]: v}),{})
      
    nonedux.setState({bigData: createLeaf(nextBigData)})
    
     //Performance should be very close to optimal. about 350x faster than slowest
  }
}
```
**In some cases, when changing an array state that has Objects or other Arrays as children can be several times more inefficient compared to using objects**

## Large objects
When ever creating and object with more than 1000 object children consider using createLeaf helper function.

If entries are only leaf: (string,  numbers, etc.) there should not be any need to improve performance

Children aren't created until they are referred to for the first time, but the promise* of creating them later when referred is work too.

<sub><sub>*(**promise** literally, not JavaScript Promise)</sub></sub>
```
...
function fetchCustomerData(){
  function(nonedux){
    fetchUserData()
      .then(({data}) => {
        let { transactions, associations } = data;
        nonedux.setState({statistics: {transactions, associations} })
        // if child statistics is not accessed previously it is created now
        nonedux.statistics.setState({transactions, associations}). 
        // pending children 'transactions' & 'associations' created;
        const {transactions: t, associations: s} = statistics; 
        // children 'transaction' & 'associations' were created & their lazy children are now pending
      })
  }
}
...
import {createLeaf} from 'none-dux'

function fetchCustomerData_Lightweight(){
  function({statistics}){
    fetchUserData()
      .then(({data}) => {
        let { transactions, associations } = data;
        transactions = createLeaf(transactions);
        associations = createLeaf(associations)
        statistics.setState({transactions, associations}). //no direct refence to children;
        statistics.transactions //undefined
        statistics.associations //undefined
        statistics.state.transactions //!==undefined
        statistics.state.associations  //!==undefined
      })
  }
}
```
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
```
Define leaf types before they are added to state

--------------
## Warnings
Using custom non-leaf JavaScript classes in reducer state is not well tested.

Using non normalized state is not a must but recommended

All keys must be strings or numbers

There is grey areas with Arrays that contain other Objects/Arrays.
```
const first = {a:1}, second = {b:2}, third = {c:3}
someArray.setState([ first, second, third, ]);
const { 0: firstChild, 1: secondChild, 2: thirdChild, } = subject;
subject.setState([ third, first, second, ]);  //switch order

/* One might expect that 'firstChild' state, 
would still points to 'first' value but it doesn't */
firstChild.state; // { c: 3, };
secondChild.state; // { a: 1, };
thirdChild.state; // { b: 2, };

//From 'setState:s' point of view the previous says:
someArray.setState({0: first, 1: second, 2: third });
...
someArray.setState({0: third, 1: first, 2:second });
```


#### Please submit reports to https://github.com/jEnbuska/none-dux ***issues***


