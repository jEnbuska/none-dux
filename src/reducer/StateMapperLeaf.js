
export default function createLeaf(obj) {
  console.warn('createLeaf is deprecated. References are defined lazily so having big non changing objects does not cause any overhead');
  return obj;
}

