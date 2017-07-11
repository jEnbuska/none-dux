import KnotTree from '../src/reducer/KnotTree';
import { knotTree, } from '../src/common';

const { resolveIdentity, createChild, removeChild, } = knotTree;

describe('knotlist', () => {
  test('make StateMappers clueless about their identity', () => {
    const tree = new KnotTree();
    expect(tree[resolveIdentity]()).toEqual([]);
    const a = tree[createChild]('a');
    expect(a[resolveIdentity]()).toEqual([ 'a', ]);
    const b = a[createChild]('b');
    expect(b[resolveIdentity]()).toEqual([ 'b', 'a', ]);
    const c = b[createChild]('c');
    expect(c[resolveIdentity]()).toEqual([ 'c', 'b', 'a', ]);

    const x = b[createChild]('x');
    expect(x[resolveIdentity]()).toEqual([ 'x', 'b', 'a', ]);
    expect(c[resolveIdentity]()).toEqual([ 'c', 'b', 'a', ]);
    expect(b[resolveIdentity]()).toEqual([ 'b', 'a', ]);
    expect(a[resolveIdentity]()).toEqual([ 'a', ]);
    const y = x[createChild]('y');
    const z = x[createChild]('z');
    expect(y[resolveIdentity]()).toEqual([ 'y', 'x', 'b', 'a', ]);
    expect(z[resolveIdentity]()).toEqual([ 'z', 'x', 'b', 'a', ]);
    const i = z[createChild]('i');
    const j = z[createChild]('j');
    const k = j[createChild]('k');
    expect(i[resolveIdentity]()).toEqual([ 'i', 'z', 'x', 'b', 'a', ]);
    expect(j[resolveIdentity]()).toEqual([ 'j', 'z', 'x', 'b', 'a', ]);
    expect(k[resolveIdentity]()).toEqual([ 'k', 'j', 'z', 'x', 'b', 'a', ]);

    b[removeChild]('x');

    expect(i[resolveIdentity]()).toEqual(false);
    expect(j[resolveIdentity]()).toEqual(false);
    expect(k[resolveIdentity]()).toEqual(false);

    expect(z[resolveIdentity]()).toEqual(false);
    expect(y[resolveIdentity]()).toEqual(false);

    expect(x[resolveIdentity]()).toEqual(false);
  });
});