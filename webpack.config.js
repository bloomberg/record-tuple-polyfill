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
const path = require("path");
const webpack = require("webpack");

module.exports = {
    context: path.resolve("./packages/record-tuple-playground"),
    entry: {
        index: "./src/index.jsx",
        "runner/index": "./src/runner/index.js",
        "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
        "ts.worker": "./src/monaco-typescript-rt/ts.worker.js",
    },
    output: {
        path: path.resolve("./packages/record-tuple-playground/dist"),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        targets: "defaults",
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    exclude: [
                                        "@babel/plugin-transform-new-target",
                                    ],
                                },
                            ],
                            "@babel/preset-react",
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.ttf/,
                use: ["file-loader"],
            },
            {
                test: /\.html/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            context: path.resolve(
                                "./packages/record-tuple-playground/src",
                            ),
                            name: "[path][name].[ext]",
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        fallback: {
            fs: false,
            path: require.resolve("path/"),
            assert: false,
            util: require.resolve("util/"),
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process",
            Buffer: "buffer",
        }),
    ],
};
