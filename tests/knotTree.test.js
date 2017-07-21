import KnotTree from '../src/reducer/KnotTree';
import { knotTree, } from '../src/common';

const { resolve, createChild, removeChild, } = knotTree;

describe('knotlist', () => {
  test('make StateMappers clueless about their identity', () => {
    const tree = new KnotTree();
    expect(tree[resolve]()).toEqual([]);
    const a = tree[createChild]('a');
    expect(a[resolve]()).toEqual([ 'a', ]);
    const b = a[createChild]('b');
    expect(b[resolve]()).toEqual([ 'b', 'a', ]);
    const c = b[createChild]('c');
    expect(c[resolve]()).toEqual([ 'c', 'b', 'a', ]);

    const x = b[createChild]('x');
    expect(x[resolve]()).toEqual([ 'x', 'b', 'a', ]);
    expect(c[resolve]()).toEqual([ 'c', 'b', 'a', ]);
    expect(b[resolve]()).toEqual([ 'b', 'a', ]);
    expect(a[resolve]()).toEqual([ 'a', ]);
    const y = x[createChild]('y');
    const z = x[createChild]('z');
    expect(y[resolve]()).toEqual([ 'y', 'x', 'b', 'a', ]);
    expect(z[resolve]()).toEqual([ 'z', 'x', 'b', 'a', ]);
    const i = z[createChild]('i');
    const j = z[createChild]('j');
    const k = j[createChild]('k');
    expect(i[resolve]()).toEqual([ 'i', 'z', 'x', 'b', 'a', ]);
    expect(j[resolve]()).toEqual([ 'j', 'z', 'x', 'b', 'a', ]);
    expect(k[resolve]()).toEqual([ 'k', 'j', 'z', 'x', 'b', 'a', ]);

    b[removeChild]('x');

    expect(i[resolve]()).toEqual(false);
    expect(j[resolve]()).toEqual(false);
    expect(k[resolve]()).toEqual(false);

    expect(z[resolve]()).toEqual(false);
    expect(y[resolve]()).toEqual(false);

    expect(x[resolve]()).toEqual(false);
  });
});