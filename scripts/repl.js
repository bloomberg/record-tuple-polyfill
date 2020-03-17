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
const repl = require("repl");
const vm = require("vm");
const babel = require("@babel/core");
const { Record, Tuple } = require("@bloomberg/record-tuple-polyfill");

global.Record = Record;
global.Tuple = Tuple;

const replPlugin = ({ types: t }) => ({
    visitor: {
        VariableDeclaration(path) {
            if (path.node.kind !== "var") {
                throw path.buildCodeFrameError(
                    "Only `var` variables are supported in the REPL",
                );
            }
        },

        Program(path) {
            if (path.get("body").some(child => child.isExpressionStatement()))
                return;

            // If the executed code doesn't evaluate to a value,
            // prevent implicit strict mode from printing 'use strict'.
            path.pushContainer(
                "body",
                t.expressionStatement(t.identifier("undefined")),
            );
        },
    },
});

const babelConfig = {
    presets: ["@babel/preset-env"],
    plugins: [
        [
            "@bloomberg/babel-plugin-proposal-record-tuple",
            { syntaxType: "hash" },
        ],
        replPlugin,
    ],
    ignore: ["./node_modules"],
};

const _eval = function(code, filename) {
    code = code.trim();
    if (!code) return undefined;

    code = babel.transform(code, Object.assign({ filename }, babelConfig)).code;

    return vm.runInThisContext(code, {
        filename: filename,
    });
};

function replStart() {
    repl.start({
        prompt: "babel > ",
        input: process.stdin,
        output: process.stdout,
        eval: replEval,
        useGlobal: true,
    });
}

function replEval(code, context, filename, callback) {
    let err;
    let result;

    try {
        if (code[0] === "(" && code[code.length - 1] === ")") {
            code = code.slice(1, -1); // remove "(" and ")"
        }

        result = _eval(code, filename);
    } catch (e) {
        err = e;
    }

    callback(err, result);
}

replStart();
