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

import { InternGraph } from "./interngraph";

describe("InternGraph", () => {
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip(".get() returns the same object twice for the same input", () => {
        function creator(values) {
            return [].concat.apply([], values);
        }

        const graph = new InternGraph(creator);

        const one = graph.get([[0], [1], [2]]);
        const two = graph.get([[0], [1], [2]]);

        expect(one).toBe(two);

        const f1 = graph.getFinalizer(one);
        const f2 = graph.getFinalizer(two);

        return new Promise(resolve => {
            setTimeout(() => {
                global.gc();
                f1.cleanupSome();
                f2.cleanupSome();
                setTimeout(() => {
                    global.gc();
                    setTimeout(() => {
                        global.gc();
                        expect(graph.size).toBe(0);
                        resolve();
                    }, 1);
                }, 1);
            }, 1);
        });
    });

    test("cleaning up a subgraph does not cleanup an observable supergraph", () => {
        function creator(values) {
            return [].concat.apply([], values);
        }

        const graph = new InternGraph(creator);

        const r1 = graph.get([[0], [1], [2]]);
        const r2 = graph.get([[0], [1]]);
        const g2 = graph.getFinalizer(r2);

        expect(graph.size).toEqual(1);
        return new Promise(resolve => {
            setTimeout(() => {
                global.gc();
                g2.cleanupSome(); // only cleanup subgraph
                setTimeout(() => {
                    global.gc();
                    setTimeout(() => {
                        expect(graph.size).toBe(1);

                        const r3 = graph.get([[0], [1], [2]]);
                        expect(r1).toBe(r3);

                        resolve();
                    }, 1);
                }, 1);
            }, 1);
        });
    });
    test("cleaning up a supergraph does not cleanup an observable subgraph", () => {
        function creator(values) {
            return [].concat.apply([], values);
        }

        const graph = new InternGraph(creator);

        const r1 = graph.get([[0], [1], [2]]);
        const r2 = graph.get([[0], [1]]);
        const g1 = graph.getFinalizer(r1);

        expect(graph.size).toEqual(1);
        return new Promise(resolve => {
            setTimeout(() => {
                global.gc();
                g1.cleanupSome(); // only cleanup supergraph
                setTimeout(() => {
                    global.gc();
                    setTimeout(() => {
                        expect(graph.size).toBe(1);

                        const r3 = graph.get([[0], [1]]);
                        expect(r2).toBe(r3);

                        resolve();
                    }, 1);
                }, 1);
            }, 1);
        });
    });
});
