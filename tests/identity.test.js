import Identity from '../src/immutability/Identity';
import { identityPrivates, } from '../src/common';

const { resolve, push, removeChild, } = identityPrivates;

describe('Identity', () => {
  test('Ensure identity integrity', () => {
    const tree = new Identity();
    expect(tree[resolve]()).toEqual([]);
    const a = tree[push]('a');
    expect(a[resolve]()).toEqual([ 'a', ]);
    const b = a[push]('b');
    expect(b[resolve]()).toEqual([ 'b', 'a', ]);
    const c = b[push]('c');
    expect(c[resolve]()).toEqual([ 'c', 'b', 'a', ]);

    const x = b[push]('x');
    expect(x[resolve]()).toEqual([ 'x', 'b', 'a', ]);
    expect(c[resolve]()).toEqual([ 'c', 'b', 'a', ]);
    expect(b[resolve]()).toEqual([ 'b', 'a', ]);
    expect(a[resolve]()).toEqual([ 'a', ]);
    const y = x[push]('y');
    const z = x[push]('z');
    expect(y[resolve]()).toEqual([ 'y', 'x', 'b', 'a', ]);
    expect(z[resolve]()).toEqual([ 'z', 'x', 'b', 'a', ]);
    const i = z[push]('i');
    const j = z[push]('j');
    const k = j[push]('k');
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