import * as Babel from "@babel/core";
import RecordAndTuple from "@bloomberg/babel-plugin-proposal-record-tuple";
import PresetEnv from "@babel/preset-env";

export function compile(code, syntaxType, callback) {
    const options = {
        presets: [[PresetEnv, { modules: false }]],
        plugins: [[RecordAndTuple, { syntaxType }], replacePolyfillImport],
    };

    return Babel.transform(code, options, function(err, result) {
        callback(err, result ? result.code : undefined);
    });
}

const importSource = `data:text/javascript;charset=utf-8,
export const { Record, Tuple, JSON, stringify, parseImmutable } = globalThis["R&T polyfill"];
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
