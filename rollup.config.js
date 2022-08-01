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
function pkg(name, path) {
    if (path) {
        return `packages/${name}/${path}`;
    }
    return `packages/${name}`;
}

const PKG_NAME = "record-tuple-polyfill";
const POLYFILL_CONFIG = [
    {
        input: pkg(PKG_NAME, "src/index.js"),
        output: [
            {
                file: pkg(PKG_NAME, "lib/index.esm.js"),
                format: "es",
            },
            {
                file: pkg(PKG_NAME, "lib/index.umd.js"),
                format: "umd",
                name: "RecordAndTuple",
            },
        ],
    },
    {
        input: pkg(PKG_NAME, "src/modify-global.js"),
        output: [
            {
                file: pkg(PKG_NAME, "lib/modify-global.esm.js"),
                format: "es",
            },
            {
                file: pkg(PKG_NAME, "lib/modify-global.umd.js"),
                format: "umd",
                name: "RecordAndTuple",
            },
        ],
    },
];

export default POLYFILL_CONFIG;
