// This file is not part of weakcollections.js to avoid circular dependencies,
// that may cause bundling problems.

// WARNING: Inside this polyfill, you must _always_ use these original
// methods if you need to store polyfilled R&T in weakmap/weakset.
export const originalWeakMapSet = WeakMap.prototype.set;
export const originalWeakSetAdd = WeakSet.prototype.add;

export const originalWeakMapHas = WeakMap.prototype.has;
export const originalWeakSetHas = WeakSet.prototype.has;
