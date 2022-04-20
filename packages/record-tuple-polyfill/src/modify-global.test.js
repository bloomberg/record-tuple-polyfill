/* globals Record, Tuple */

import "./modify-global";

describe("Basic behavior", () => {
    test("Records and Tuples can be created", () => {
        expect(() => Record({ x: 1, y: 2 })).not.toThrow();
        expect(() => Tuple(1, 2, 3)).not.toThrow();
    });

    test("Records and Tuples cannot be used as WeakMap/WeakSet keys", () => {
        const wm = new WeakMap();
        const ws = new WeakSet();

        expect(() => {
            wm.set(Record({}), 1);
        }).toThrow(new TypeError("Invalid value used as weak map key"));
        expect(() => {
            wm.set(Tuple(), 1);
        }).toThrow(new TypeError("Invalid value used as weak map key"));

        expect(() => {
            ws.add(Record({}));
        }).toThrow(new TypeError("Invalid value used in weak set"));
        expect(() => {
            ws.add(Tuple());
        }).toThrow(new TypeError("Invalid value used in weak set"));
    });
});
