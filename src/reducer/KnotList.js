const _key = Symbol('_knotlist_key');
const _removed = Symbol('_knotlist_removed');
const _prev = Symbol('_knotlist_prev');

export default class KnotList {
  constructor(key, prev) {
    this[_prev]= prev;
    this[_key] = key;
    this[_removed] = false;
  }

  _knotlist_add(key) {
    key = key+'';
    if (this[key]) {
      throw new Error(key+' know already exists ');
    }
    this[key] = new KnotList(key, this);
    return this[key];
  }

  _knotlist_replace_key(key){
    key = key+'';
    if(this[_prev]){
      delete this[_prev][this[_key]]
      this[_prev][key] = this;
    }
    this[_key] = key;
  }

  _knotlist_remove(key) {
    key = key+'';
    if (this[key]) {
      this[key][_removed]= true;
      delete this[key][_prev];
      delete this[key];
    }else{
      throw new Error('removing invalid key'+key)
    }
  }

  _knotlist_path(acc = []) {
    if (this[_removed]) {
      return false;
    }
    if (this[_key]) {
      acc.push(this[_key]);
      return this[_prev]._knotlist_path(acc);
    }
    return acc.reverse();
  }

  getId() {
    return this[_key];
  }

}
