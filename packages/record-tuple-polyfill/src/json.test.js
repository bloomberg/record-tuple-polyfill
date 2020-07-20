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

import { Record, Tuple, stringify, parseImmutable } from "./";

describe("stringify", () => {
    test("supports records and tuples", () => {
        const value = Record({
            foo: 2,
            bar: Tuple("a", Record({}), Tuple()),
        });

        expect(stringify(value)).toBe(`{"bar":["a",{},[]],"foo":2}`);
    });

    test("supports the 'space' parameter", () => {
        const value = Record({
            foo: 2,
            bar: Tuple("a", Record({}), Tuple()),
        });

        expect(stringify(value, null, 2)).toMatchInlineSnapshot(`
                    "{
                      \\"bar\\": [
                        \\"a\\",
                        {},
                        []
                      ],
                      \\"foo\\": 2
                    }"
            `);

        expect(stringify(value, null, "hello")).toMatchInlineSnapshot(`
                    "{
                    hello\\"bar\\": [
                    hellohello\\"a\\",
                    hellohello{},
                    hellohello[]
                    hello],
                    hello\\"foo\\": 2
                    }"
            `);
    });

    test("supports the replacer array", () => {
        const value = Record({
            foo: 2,
            bar: Tuple(
                "a",
                Record({
                    bar: Record({ bar: 1, baz: 5 }),
                    asd: 3,
                    baz: 4,
                }),
                Tuple(),
            ),
        });

        expect(stringify(value, ["bar", Object("baz"), 0, Object(1)])).toBe(
            '{"bar":["a",{"bar":{"bar":1,"baz":5},"baz":4},null]}',
        );
    });

    test("the replacer function receives records and tuples as args", () => {
        const value = {
            a: Record({ x: 1 }),
            b: { y: Tuple() },
        };

        const args = [];

        JSON.stringify(value, (key, value) => {
            args.push({ key, value });
            return value;
        });

        expect(args).toEqual([
            { key: "", value: value },
            { key: "a", value: Record({ x: 1 }) },
            { key: "x", value: 1 },
            { key: "b", value: { y: Tuple() } },
            { key: "y", value: Tuple() },
        ]);
    });

    test("works with circular objects", () => {
        const obj = {
            foo: Tuple(1, 2, 3),
        };
        obj.bar = obj;

        expect(stringify(obj, ["foo", 0, 1, 2])).toMatchInlineSnapshot(
            `"{\\"foo\\":[1,2,3]}"`,
        );
    });
});

describe("parseImmutable", () => {
    describe("it works with any JSON value", () => {
        const cases = ["1", "0.3", "true", "false", "null", '"aaa"'];

        test.each(cases)("primitive %s", text => {
            expect(parseImmutable(text)).toBe(JSON.parse(text));
        });

        test("JSON objects and arrays", () => {
            const text = `
                {
                    "foo": {
                        "bar": [{ "baz": [] }, {}]
                    }
                }
            `;

            const expected = Record({
                foo: Record({
                    bar: Tuple(Record({ baz: Tuple() }), Record({})),
                }),
            });

            expect(parseImmutable(text)).toBe(expected);
        });
    });

    describe("reviver function", () => {
        test("only receives immutable values", () => {
            const text = `
                {
                    "foo": {
                        "bar": [{ "baz": 42 }, false]
                    }
                }
            `;

            const converted = Record({
                foo: Record({
                    bar: Tuple(Record({ baz: 42 }), false),
                }),
            });

            const calls = [];

            parseImmutable(text, (key, value) => {
                calls.push({ key, value });
                return value;
            });

            expect(calls).toEqual([
                { key: "baz", value: 42 },
                { key: "0", value: converted.foo.bar[0] },
                { key: "1", value: false },
                { key: "bar", value: converted.foo.bar },
                { key: "foo", value: converted.foo },
                { key: "", value: converted },
            ]);
        });

        test("can return a different value", () => {
            const test = `
            {
                "foo": 1,
                "bar": 2,
                "baz": 3,
                "asd": [{ "x": 4 }]
            }
            `;

            const reviver = (key, value) => {
                if (value === 1) return BigInt("1");
                if (value === 2) return Record({ foo: Tuple(2, 3) });
                if (value === 3) return "aaa";
                if (value === 4) return 2;
                return value;
            };

            const expected = Record({
                foo: BigInt("1"),
                bar: Record({ foo: Tuple(2, 3) }),
                baz: "aaa",
                asd: Tuple(Record({ x: 2 })),
            });

            expect(parseImmutable(test, reviver)).toBe(expected);
        });

        test("can return undefined to remove properties", () => {
            const test = `
            {
                "foo": 1,
                "bar": 2,
                "baz": 3,
                "asd": [1, 2, 3]
            }
            `;

            const reviver = (key, value) => {
                if (value === 2) return;
                if (key === "baz") return null; // not removed
                return value;
            };

            const expected = Record({
                foo: 1,
                baz: null,
                asd: Tuple(1, undefined, 3),
            });

            expect(parseImmutable(test, reviver)).toBe(expected);
        });

        test("cannot return mutable values", () => {
            const returning = val => {
                return () => parseImmutable("{}", () => val);
            };

            expect(returning({})).toThrow(Error); // TODO: TypeError
            expect(returning([])).toThrow(Error);
            expect(returning(/a/)).toThrow(Error);
            //expect(returning(new String(""))).toThrow(Error);

            expect(returning(Symbol())).not.toThrow();
            expect(returning(null)).not.toThrow();
        });

        test("this is undefined", () => {
            const text = `
                {
                    "foo": 3
                }
            `;

            const receivers = [];

            parseImmutable(text, function(key, value) {
                receivers.push(this);
                return value;
            });

            for (const r of receivers) expect(r).toBeUndefined();
        });
    });
});
