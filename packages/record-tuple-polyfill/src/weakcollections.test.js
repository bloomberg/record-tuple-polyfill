import {
    Record,
    Tuple,
    WeakMap$prototype$set,
    WeakSet$prototype$add,
} from "./";

describe("WeakMap$prototype$set", () => {
    test("throws a TypeError when key is a Record or Tuple", () => {
        const map = new WeakMap();
        WeakMap$prototype$set.call(map, {}, true);

        expect(() => {
            WeakMap$prototype$set.call(map, Record({}), true);
        }).toThrow(new TypeError("Invalid value used as weak map key"));
        expect(() => {
            WeakMap$prototype$set.call(map, Tuple(), true);
        }).toThrow(new TypeError("Invalid value used as weak map key"));
    });
    test("correctly checks for the [[WeakMapData]] internal slot first", () => {
        expect(() => {
            WeakMap$prototype$set.call(123, Record({}), true);
        }).toThrow(/incompatible/);
    });
});
describe("WeakSet$prototype$add", () => {
    test("throws a TypeError when value is a Record or Tuple", () => {
        const set = new WeakSet();
        WeakSet$prototype$add.call(set, {});

        expect(() => {
            WeakSet$prototype$add.call(set, Record({}));
        }).toThrow(new TypeError("Invalid value used in weak set"));
        expect(() => {
            WeakSet$prototype$add.call(set, Tuple());
        }).toThrow(new TypeError("Invalid value used in weak set"));
    });
    test("correctly checks for the [[WeakSetData]] internal slot first", () => {
        expect(() => {
            WeakSet$prototype$add.call(123, Record({}));
        }).toThrow(/incompatible/);
    });
});
