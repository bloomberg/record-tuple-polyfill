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

import { Record, Tuple, stringify } from "./";

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
            `"{\\"foo\\":[null,null,null]}"`,
        );
    });
});
