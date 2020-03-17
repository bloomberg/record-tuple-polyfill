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

import { ArrayKeyedMap } from "./arraykeyedmap";

describe("ArrayKeyedMap", () => {
    test("set/get/has/delete", () => {
        const map = new ArrayKeyedMap();

        // empty map
        expect(map.has([1, 2, 3])).toBe(false);
        expect(map.has([1, 2])).toBe(false);

        // fill map
        map.set([1, 2, 3], 1);
        map.set([1, 2], 2);

        // .has()
        expect(map.has([1, 2, 3])).toBe(true);
        expect(map.has([1, 2])).toBe(true);

        // .get()
        expect(map.get([1, 2, 3])).toBe(1);
        expect(map.get([1, 2])).toBe(2);

        // delete superkey
        // should still have subkey
        expect(map.delete([1, 2, 3])).toBe(true);
        expect(map.has([1, 2])).toBe(true);
        expect(map.get([1, 2])).toBe(2);

        // overwrite key
        map.set([1, 2], 3);
        expect(map.get([1, 2])).toBe(3);

        // delete subkey
        // should no longer have subkey
        expect(map.delete([1, 2])).toBe(true);
        expect(map.has([1, 2])).toBe(false);

        // never had key
        expect(map.delete(["a"])).toBe(false);
    });
});
