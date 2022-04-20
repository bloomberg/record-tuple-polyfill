import { isRecord, isTuple } from "./utils";
import {
    originalWeakMapHas,
    originalWeakMapSet,
    originalWeakSetAdd,
    originalWeakSetHas,
} from "./weakcollections-original";

export function WeakMap$prototype$set(key, value) {
    // force a RequireInternalSlot check
    originalWeakMapHas.call(this, key);

    if (isRecord(key) || isTuple(key)) {
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

    if (isRecord(key) || isTuple(key)) {
        throw new TypeError("Invalid value used in weak set");
    }

    return originalWeakSetAdd.call(this, key, value);
}
Object.defineProperty(WeakMap$prototype$set, "name", {
    value: "add",
    configurable: true,
});
