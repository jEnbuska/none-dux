import SubStore from './SubStore';

export default class ReducerParent extends SubStore {

  __substore_id__ = 'root';
  __substore_identity__ = [];
  __substore_parent__ = { _notifyUp() {}, };

  constructor(state) {
    super({}, 'root', { _notifyUp() {}, }, 0, [], { dispatch: () => { }, });
    this._onSetState(state);
  }

}
