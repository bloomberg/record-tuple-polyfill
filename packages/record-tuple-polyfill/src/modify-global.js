import { stringify, parseImmutable } from "./json";
import { Record } from "./record";
import { Tuple } from "./tuple";

if (!globalThis.Record) {
    globalThis.Record = Record;
}
if (!globalThis.Tuple) {
    globalThis.Tuple = Tuple;
}

JSON.stringify = stringify;
JSON.parseImmutable = parseImmutable;
