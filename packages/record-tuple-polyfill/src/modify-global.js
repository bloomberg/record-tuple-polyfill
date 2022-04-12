import { stringify, parseImmutable } from "./json";
import { Record } from "./record";
import { Tuple } from "./tuple";
import {
    WeakMap$prototype$set,
    WeakSet$prototype$add,
} from "./weakcollections";

if (!globalThis.Record) {
    globalThis.Record = Record;
}
if (!globalThis.Tuple) {
    globalThis.Tuple = Tuple;
}

JSON.stringify = stringify;
JSON.parseImmutable = parseImmutable;

WeakMap.prototype.set = WeakMap$prototype$set;
WeakSet.prototype.add = WeakSet$prototype$add;
