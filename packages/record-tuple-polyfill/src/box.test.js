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

import { Box, Record, Tuple } from "./index";

const hasOwn = Function.call.bind(Object.hasOwnProperty);

test("Box called with zero arguments throws", () => {
    expect(() => Box()).toThrow();
});

test("Box creates a Box that wraps an object", () => {
    const obj = {};
    const box = Box(obj);
    expect(box.unbox()).toBe(obj);
});

test("two Boxes wrapping the same value are equal", () => {
    const obj = {};
    const box1 = Box(obj);
    const box2 = Box(obj);
    expect(box1).toBe(box2);
});

test("two Boxes wrapping different values are equal", () => {
    const box1 = Box({});
    const box2 = Box({});
    expect(box1).not.toBe(box2);
});

test("Box function creates frozen objects", () => {
    expect(Object.isFrozen(Box({}))).toBe(true);
});

test("Box has no own properties", () => {
    expect(Reflect.ownKeys(Box({})).length).toBe(0);
});
describe("Box.containsBoxes", () => {
    test("Box.containsBoxes throws when provided invalid argument", () => {
        expect(() => Box.containsBoxes({})).toThrow();
        expect(() => Box.containsBoxes(true)).toThrow();
        expect(() => Box.containsBoxes(undefined)).toThrow();
    });
    test("Box.containsBoxes correctly finds boxes in Records", () => {
        const rec1 = Record({ foo: "foo" });
        const rec2 = Record({ foo: Box({ a: 1 }) });
        const rec3 = Record({ foo: Record({ bar: Box({ a: 1 }) }) });

        expect(Box.containsBoxes(rec1)).toBe(false);
        expect(Box.containsBoxes(rec2)).toBe(true);
        expect(Box.containsBoxes(rec3)).toBe(true);
    });
    test("Box.containsBoxes correctly finds boxes in Tuples", () => {
        const tup1 = Tuple(1, 2, 3);
        const tup2 = Tuple(1, Box({}), 3);
        const tup3 = Tuple(1, Tuple(2, Box({})), 3);

        expect(Box.containsBoxes(tup1)).toBe(false);
        expect(Box.containsBoxes(tup2)).toBe(true);
        expect(Box.containsBoxes(tup3)).toBe(true);
    });
    test("Box.containsBoxes returns true for Boxes", () => {
        expect(Box.containsBoxes(Box({}))).toBe(true);
    });
});

describe("all and only the specified prototype methods exist", () => {
    const names = ["constructor", "valueOf", "unbox", Symbol.toStringTag];
    test.each(names)(".%s", name => {
        // We can't use expect().toHaveProperty because its doesn't support symbols
        expect(hasOwn(Box.prototype, name)).toBe(true);
    });

    test("no extra properties", () => {
        expect(Reflect.ownKeys(Box.prototype)).toHaveLength(names.length);
    });
});

describe("correct descriptors", () => {
    const desc = Object.getOwnPropertyDescriptor;

    test.each(["containsBoxes"])("Tuple.%s", name => {
        expect(desc(Box, name)).toEqual({
            writable: true,
            enumerable: false,
            configurable: true,
            value: expect.any(Function),
        });
    });

    test("Box.name", () => {
        expect(desc(Box, "name")).toEqual({
            writable: false,
            enumerable: false,
            configurable: true,
            value: "Box",
        });
    });

    const methods = Reflect.ownKeys(Box.prototype).filter(
        n => n !== Symbol.toStringTag,
    );

    test.each(methods)("Box.prototype.%s", name => {
        expect(desc(Box.prototype, name)).toEqual({
            writable: true,
            enumerable: false,
            configurable: true,
            value: expect.any(Function),
        });
    });

    test("Box.prototype[Symbol.toStringTag]", () => {
        expect(desc(Box.prototype, Symbol.toStringTag)).toEqual({
            writable: false,
            enumerable: false,
            configurable: true,
            value: expect.any(String),
        });
    });
});
