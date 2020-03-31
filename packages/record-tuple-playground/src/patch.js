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

import * as Polyfill from "@bloomberg/record-tuple-polyfill";
import * as Monaco from "monaco-editor";
import { conf, language } from "./patch-language";

const POLYFILL_DTS = `
interface RecordConstructor {
    /**
     * @param value The value which should be checked.
     * @return A Boolean indicating whether or not the given value is a Record.
     */
    isRecord(value: any): boolean;
}

interface TupleConstructor {
    /**
     * @param value The value which should be checked.
     * @return A Boolean indicating whether or not the given value is a Tuple.
     */
    isTuple(value: any): boolean;
}

/**
 * Provides functionality common to JavaScript records.
 */
export const Record: RecordConstructor;

/**
 * Provides functionality common to JavaScript tuples.
 */
export const Tuple: TupleConstructor;
`;

function patch() {
    // eslint-disable-next-line no-undef
    window.MonacoEnvironment = {
        getWorkerUrl: function(moduleId, label) {
            if (label === "javascript" || label === "typescript") {
                return "./ts.worker.js";
            }
            return "./editor.worker.js";
        },
    };

    Monaco.languages.typescript.javascriptDefaults.addExtraLib(
        POLYFILL_DTS,
        "file:///node_modules/@types/@bloomberg/record-tuple-polyfill.d.ts",
    );

    // dirty hack to not require bundling of the output of babel
    // eslint-disable-next-line no-undef
    window.require = function(path) {
        if (path !== "@bloomberg/record-tuple-polyfill") {
            throw new Error("unexpected");
        }
        return Polyfill;
    };
}

function patchLanguage() {
    Monaco.languages.getLanguages().forEach(lang => {
        if (lang.id === "typescript" || lang.id === "javascript") {
            lang.loader = () => Promise.resolve({ conf, language });
        }
    });
}

patch();
patchLanguage();
