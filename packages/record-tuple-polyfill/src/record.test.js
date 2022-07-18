/*
 ** Copyright 2020 Bloomberg Finance L.P.
 **
 ** Licensed under the Apache License, Version 2.0 (the "License");
 ** you may not use this file except in compliance with the License.
 ** You may obtain a copy of the License at
 **
 **     http://www.apache.org/licenses/LICENSE-2.0
 **
 ** Unless required by applicable law or agreed to in writing, software
 ** distributed under the License is distributed on an "AS IS" BASIS,
 ** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ** See the License for the specific language governing permissions and
 ** limitations under the License.
 */

import { Record, Tuple } from "./index";

test("Record function throws when presented a non-plain object", () => {
    expect(() => Record(true)).toThrow();
    expect(() => Record(1)).toThrow();
    expect(() => Record(BigInt(1))).toThrow();
    expect(() => Record("test")).toThrow();
    expect(() => Record(Symbol())).toThrow();
    expect(() => Record(function() {})).toThrow();
    expect(() => Record(null)).toThrow();
    expect(() => Record(undefined)).toThrow();
});

test("records cannot contain objects", () => {
    expect(() => Record({ a: {} })).toThrow();
    expect(() => Record({ a: [] })).toThrow();
    expect(() => Record({ a: function() {} })).toThrow();
});

test("records doesn't unbox boxed primitives", () => {
    expect(() => Record({ a: Object(true) })).toThrow(TypeError);
    expect(() => Record({ a: Object(1) })).toThrow(TypeError);
    expect(() => Record({ a: Object("test") })).toThrow(TypeError);
    expect(() => Record({ a: Object(Symbol()) })).toThrow(TypeError);
});

test("records can't have symbol keys", () => {
    expect(() => Record({ [Symbol()]: true })).toThrow(TypeError);
});

test("Record from object only uses enumerable properties", () => {
    const template = Object.create(null, {
        [Symbol("non-enumerable-symbol-prop")]: {
            enumerable: false,
            value: true,
        },
        ["non-enumerable-string-prop"]: {
            enumerable: false,
            value: true,
        },
        ["non-enumerable-string-getter"]: {
            enumerable: false,
            get() {
                return true;
            },
        },
        ["enumerable-string-prop"]: {
            enumerable: true,
            value: true,
        },
        ["enumerable-string-getter"]: {
            enumerable: true,
            get() {
                return true;
            },
        },
    });
    expect(Record(template)).toBe(
        Record({
            "enumerable-string-prop": true,
            "enumerable-string-getter": true,
        }),
    );
});

test("records are correctly identified as records", () => {
    expect(Record.isRecord(Record({ a: 1 }))).toBe(true);
    expect(Record.isRecord(Tuple(1, 2, 3))).toBe(false);
    expect(Record.isRecord({ a: 1 })).toBe(false);
    expect(Record.isRecord(function() {})).toBe(false);
    expect(Record.isRecord(true)).toBe(false);
    expect(Record.isRecord(1)).toBe(false);
    expect(Record.isRecord("test")).toBe(false);
    expect(Record.isRecord(Symbol())).toBe(false);
});

test("Record function creates deeply frozen objects", () => {
    expect(Object.isFrozen(Record({ a: 1 }))).toBe(true);
    expect(Object.isFrozen(Record({ a: Record({ b: 2 }) }).b)).toBe(true);
});

test("Record function creates objects with keys in sorted order", () => {
    expect(Object.keys(Record({ a: 1, b: 2 }))).toEqual(["a", "b"]);
    expect(Object.keys(Record({ b: 1, a: 2 }))).toEqual(["a", "b"]);
    expect(Object.keys(Record({ b: 1, a: 2, 0: 3 }))).toEqual(["0", "a", "b"]);
    expect(Object.keys(Record({ b: 1, a: 2, 0: 3 }))).toEqual(["0", "a", "b"]);
});

test("records with the same structural equality will be equal", () => {
    expect(Record({ a: 1 })).toBe(Record({ a: 1 }));
    expect(Record({ a: 1, b: 2 })).toBe(Record({ a: 1, b: 2 }));
    expect(Record({ b: 2, a: 1 })).toBe(Record({ a: 1, b: 2 }));
    const sym = Symbol("test");
    expect(Record({ b: sym, a: 1 })).toBe(Record({ a: 1, b: sym }));
    expect(Record({ 0: 0, 1: 1, 2: 2 })).toBe(Record({ 1: 1, 0: 0, 2: 2 }));
    expect(Record({ a: Record({ b: 2 }) })).toBe(
        Record({ a: Record({ b: 2 }) }),
    );

    expect(Record({ a: 1 })).not.toBe(Record({ a: 2 }));
    expect(Record({ a: 1 })).not.toBe(Record({ b: 1 }));
});

test("Record equality handles -/+0 and NaN correctly", () => {
    expect(Record({ a: -0 })).toBe(Record({ a: -0 }));
    expect(Record({ a: +0 })).toBe(Record({ a: +0 }));
    expect(Record({ a: -0 })).toBe(Record({ a: +0 }));
    expect(Record({ a: +0 })).toBe(Record({ a: -0 }));
    expect(Record({ a: NaN })).toBe(Record({ a: NaN }));
});

test("Records can be spread", () => {
    expect(Record({ ...Record({ a: 1 }), ...Record({ b: 2 }) })).toBe(
        Record({ a: 1, b: 2 }),
    );
    expect(Record({ ...Record({ a: 1 }), ...Record({ a: 2 }) })).toBe(
        Record({ a: 2 }),
    );
});
test("Records work with Object.entries", () => {
    expect(Object.entries(Record({ a: 1 }))).toEqual([["a", 1]]);
    expect(Object.entries(Record({ a: 1, b: 2 }))).toEqual([
        ["a", 1],
        ["b", 2],
    ]);
    expect(Object.entries(Record({ b: 2, a: 1 }))).toEqual([
        ["a", 1],
        ["b", 2],
    ]);
});

test("Record.fromEntries", () => {
    expect(
        Record.fromEntries([
            ["a", 1],
            ["b", 2],
        ]),
    ).toBe(Record({ a: 1, b: 2 }));
    expect(
        Record.fromEntries([
            ["b", 2],
            ["a", 1],
        ]),
    ).toBe(Record({ a: 1, b: 2 }));
    expect(() =>
        Record.fromEntries([
            ["b", {}],
            ["a", 1],
        ]),
    ).toThrow(TypeError);

    let sym = Symbol();
    expect(() => Record.fromEntries([[sym, 1]])).toThrow(TypeError);
    expect(Record.fromEntries([["foo", sym]])).toBe(Record({ foo: sym }));
});

test("Record.fromEntries validate entries in order", () => {
    let iteratorCount = 0;

    function countIterable(values) {
        return {
            [Symbol.iterator]() {
                const it = values[Symbol.iterator]();
                return {
                    next() {
                        iteratorCount++;
                        return it.next();
                    },
                };
            },
        };
    }

    // Invalid value: (isPrimitive(value) === false):
    expect(() => {
        Record.fromEntries(
            countIterable([
                ["valid-key-1", {}],
                ["valid-key-2", "valid-value"],
            ]),
        );
    }).toThrow(TypeError);
    expect(iteratorCount).toBe(1);
    iteratorCount = 0;

    // Invalid symbol key: (typeof key === 'symbol')
    expect(() => {
        Record.fromEntries(
            countIterable([
                [Symbol("invalid-key"), "valid-value"],
                ["valid-key-2", "valid-value"],
            ]),
        );
    }).toThrow(TypeError);
    expect(iteratorCount).toBe(1);
    iteratorCount = 0;

    // Invalid object key: (toString(key) throws)
    expect(() => {
        Record.fromEntries(
            countIterable([
                [Object(Symbol("invalid-key")), "valid-value"],
                ["valid-key-2", "valid-value"],
            ]),
        );
    }).toThrow(TypeError);
    expect(iteratorCount).toBe(1);
    iteratorCount = 0;
});

test("Records work with Object.values", () => {
    expect(Object.values(Record({ a: 1, b: 2 }))).toEqual([1, 2]);
    expect(Object.values(Record({ b: 1, a: 2 }))).toEqual([2, 1]);
});

test("Record.prototype.toString", () => {
    expect(Record({ a: 1 }).toString()).toEqual("[record Record]");
});

describe("correct descriptors", () => {
    const desc = Object.getOwnPropertyDescriptor;

    test.each(["isRecord", "fromEntries"])("Record.%s", name => {
        expect(desc(Record, name)).toEqual({
            writable: true,
            enumerable: false,
            configurable: true,
            value: expect.any(Function),
        });
    });

    test("Record.name", () => {
        expect(desc(Record, "name")).toEqual({
            writable: false,
            enumerable: false,
            configurable: true,
            value: "Record",
        });
    });

    test("Record.length", () => {
        expect(desc(Record, "length")).toEqual({
            writable: false,
            enumerable: false,
            configurable: true,
            value: 1,
        });
    });
});
