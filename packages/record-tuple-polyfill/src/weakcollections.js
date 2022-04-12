import { Record } from "./record";
import { Tuple } from "./tuple";

const originalWeakMapHas = WeakMap.prototype.has;
const originalWeakMapSet = WeakMap.prototype.set;

const originalWeakSetHas = WeakSet.prototype.has;
const originalWeakSetAdd = WeakSet.prototype.add;

export function WeakMap$prototype$set(key, value) {
    // force a RequireInternalSlot check
    originalWeakMapHas.call(this, key);

    if (Record.isRecord(key) || Tuple.isTuple(key)) {
        throw new TypeError("Invalid value used as weak map key");
    }
    return originalWeakMapSet.call(this, key, value);
}
Object.defineProperty(WeakMap$prototype$set, "name", {
    value: "set",
    configurable: true,
});

export function WeakSet$prototype$add(key, value) {
    // force a RequireInternalSlot check
    originalWeakSetHas.call(this, key);

    if (Record.isRecord(key) || Tuple.isTuple(key)) {
        throw new TypeError("Invalid value used in weak set");
    }

    return originalWeakSetAdd.call(this, key, value);
}
Object.defineProperty(WeakMap$prototype$set, "name", {
    value: "add",
    configurable: true,
});
