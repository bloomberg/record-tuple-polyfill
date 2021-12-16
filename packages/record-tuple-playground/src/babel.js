import * as Babel from "@babel/core";
import RecordAndTuple from "@babel/plugin-proposal-record-and-tuple";
import PresetEnv from "@babel/preset-env";
import PresetReact from "@babel/preset-react";

export function compile(code, syntaxType, callback) {
    const options = {
        presets: [[PresetEnv, { modules: false }], [PresetReact]],
        plugins: [[RecordAndTuple, { syntaxType }], replacePolyfillImport],
    };

    return Babel.transform(code, options, function(err, result) {
        callback(err, result ? result.code : undefined);
    });
}

const importSource = `data:text/javascript;charset=utf-8,
export const { Record, Tuple, Box, JSON, stringify, parseImmutable } = globalThis["R&T polyfill"];
`;

function replacePolyfillImport({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                if (
                    path.node.source.value ===
                    "@bloomberg/record-tuple-polyfill"
                ) {
                    path.get("source").replaceWith(
                        t.stringLiteral(importSource),
                    );
                }
            },
        },
    };
}
