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
import babel from "rollup-plugin-babel";

function pkg(name, path) {
    if (path) {
        return `packages/${name}/${path}`;
    }
    return `packages/${name}`;
}

const POLYFILL_CONFIG = {
    external: [],
    input: pkg("record-tuple-polyfill", "src/index.js"),
    output: [
        {
            file: pkg("record-tuple-polyfill", "lib/index.esm.js"),
            format: "es",
        },
        {
            file: pkg("record-tuple-polyfill", "lib/index.umd.js"),
            format: "umd",
            name: "RecordAndTuple",
        },
    ],
    plugins: [babel()],
};

export default [POLYFILL_CONFIG];
