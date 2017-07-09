import AutoReducer from './AutoReducer';

export default class ReducerParent extends AutoReducer {

  __autoreducer_id__ = 'root';
  __autoreducer_identity__ = [];
  __autoreducer_parent__ = { _notifyUp() {}, };

  constructor(state) {
    super({}, 'root', { _notifyUp() {}, }, 0, [], { dispatch: () => { }, });
    this.__applySetState(state);
  }

  getState(){
    return this.__autoreducer_state__;
  }

}
