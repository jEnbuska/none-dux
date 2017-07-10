import KnotList from '../src/reducer/KnotList';

describe('knotlist', () => {
  test('make AutoReducers clueless about their identity', () => {

    const list = new KnotList();
    expect(list._knotlist_path()).toEqual([]);
    const a = list._knotlist_add('a');
    expect(a._knotlist_path()).toEqual([ 'a', ]);
    const b = a._knotlist_add('b');
    expect(b._knotlist_path()).toEqual([ 'a', 'b', ]);
    const c = b._knotlist_add('c');
    expect(c._knotlist_path()).toEqual([ 'a', 'b', 'c', ]);

    const x = b._knotlist_add('x');
    expect(x._knotlist_path()).toEqual([ 'a', 'b', 'x', ]);
    expect(c._knotlist_path()).toEqual([ 'a', 'b', 'c', ]);
    expect(b._knotlist_path()).toEqual([ 'a', 'b', ]);
    expect(a._knotlist_path()).toEqual([ 'a', ]);
    const y = x._knotlist_add('y');
    const z = x._knotlist_add('z');
    expect(y._knotlist_path()).toEqual([ 'a', 'b', 'x', 'y', ]);
    expect(z._knotlist_path()).toEqual([ 'a', 'b', 'x', 'z', ]);
    const i = z._knotlist_add('i');
    const j = z._knotlist_add('j');
    const k = j._knotlist_add('k');
    expect(i._knotlist_path()).toEqual([ 'a', 'b', 'x', 'z', 'i', ]);
    expect(j._knotlist_path()).toEqual([ 'a', 'b', 'x', 'z', 'j', ]);
    expect(k._knotlist_path()).toEqual([ 'a', 'b', 'x', 'z', 'j', 'k', ]);

    b._knotlist_remove('x');

    expect(i._knotlist_path()).toEqual(false);
    expect(j._knotlist_path()).toEqual(false);
    expect(k._knotlist_path()).toEqual(false);

    expect(z._knotlist_path()).toEqual(false);
    expect(y._knotlist_path()).toEqual(false);

    expect(x._knotlist_path()).toEqual(false);
  });
});