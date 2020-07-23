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

import "./patch";
import "regenerator-runtime/runtime";

import { compile } from "./babel";

import React from "react";
import { render } from "react-dom";
import MonacoEditor from "react-monaco-editor";
import { ObjectInspector } from "react-inspector";

import Normalize from "./normalize.css";
import Skeleton from "./skeleton.css";
import Html from "./index.html";
import Runner from "./runner/index.html";

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const callNow = immediate && !timeout;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const CONSOLE_STYLES = {
    LOG_ICON_WIDTH: "0px",
    LOG_ICON_HEIGHT: "0px",
    BASE_FONT_SIZE: "18px",
    BASE_LINE_HEIGHT: "32px",
    ARROW_FONT_SIZE: "18px",
    TREENODE_FONT_SIZE: "18px",
    TREENODE_LINE_HEIGHT: "32px",
};

const DEFAULT_PREFIX = String.raw`import { Record, Tuple } from "@bloomberg/record-tuple-polyfill";
const log = console.log;
`;

const DEFAULT_HASH = DEFAULT_PREFIX + String.raw`
const record = #{ prop: 1 };
const tuple = #[1, 2, 3];

log("isRecord", Record.isRecord(record));
log("isRecord", Record.isRecord({ prop: 1 }));

// Simple Equality
log("simple",
    #{ a: 1 } === #{ a:1 },
    #[1] === #[1]);

// Nested Equality
log("nested", #{ a: #{ b: 123 }} === #{ a: #{ b: 123 }});

// Order Independent
log("!order", #{ a: 1, b: 2 } === #{ b: 2, a: 1});

// -0, +0
log("-0 === +0", -0 === +0);
log("#[-0] === #[+0]", #[-0] === #[+0]);

// NaN
log("NaN === NaN", NaN === NaN);
log("#[NaN] === #[NaN]", #[NaN] === #[NaN]);
`;

const DEFAULT_BAR = DEFAULT_PREFIX + String.raw`
const record = {| prop: 1 |};
const tuple = [|1, 2, 3|];

log("isRecord", Record.isRecord(record));
log("isRecord", Record.isRecord({ prop: 1 }));

// Simple Equality
log("simple",
    {| a: 1 |} === {| a:1 |},
    [|1|] === [|1|]);

// Nested Equality
log("nested", {| a: {| b: 123 |}|} === {| a: {| b: 123 |}|});

// Order Independent
log("!order", {| a: 1, b: 2 |} === {| b: 2, a: 1|});

// -0, +0
log("-0 === +0", -0 === +0);
log("[|-0|] === [|+0|]", [|-0|] === [|+0|]);

// NaN
log("NaN === NaN", NaN === NaN);
log("[|NaN|] === [|NaN|]", [|NaN|] === [|NaN|]);
`;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isError: false,
            output: "",
            syntax: props.syntax || "hash",
            logs: [],
            showOutput: false,
        };

        this.onEditorMounted = this.onEditorMounted.bind(this);
        this.onChange = debounce(this.onChange.bind(this), 500);
        this.onSyntaxChange = this.onSyntaxChange.bind(this);
        this.onToggleShowOutput = this.onToggleShowOutput.bind(this);
        this.update = this.update.bind(this);

        this.value = props.content || "";
        this.outputEditor = React.createRef();

        const methods = ["log", "warn", "error", "info", "debug", "command", "result"];
        this.fakeConsole = methods.reduce((obj, m) => {
            obj[m] = (...args) => {
                this.setState(state => ({
                    logs: [...state.logs, { level: m, data: args }],
                }));
            };
            return obj;
         }, {})

        this.inputModel = monaco.editor.createModel(this.value, "javascript", "file:///index.js");
        this.editorOptions = {
            fontSize: 18,
            theme: "vs-dark",
            automaticLayout: true,
            codeLens: false,
            minimap: {
                enabled: false,
            },
            model: this.inputModel,
            language: "rt",
        };

        this.outputOptions = Object.assign({}, this.editorOptions, {
            model: undefined,
            language: "javascript",
            readOnly: true,
        });

        this.errorOptions = Object.assign({}, this.editorOptions, {
            lineNumbers: "off",
            glyphMargins: false,
            folding: false,
            lineDecoratorsWidth: 0,
            lineNumbersMinChars: 0,
            model: undefined,
            language: "plaintext",
            readOnly: true,
            wordWrap: "on",
        });

        this.iframe = null;
    }

    render() {
        return (
            <div className="container">
                <div className="topBar">
                    <div className="left">
                        <span>Syntax Type:</span>
                        <select onChange={this.onSyntaxChange} value={this.state.syntax}>
                            <option value="hash">hash</option>
                            <option value="bar">bar</option>
                        </select>
                        <button className={this.state.showOutput ? "button-primary" : ""}
                            onClick={this.onToggleShowOutput}>Show Output</button>
                    </div>
                    <div className="right">
                        <span>Record and Tuple Playground</span>
                        <span><a href="https://tinyurl.com/RecordTupleFeedback">Give Feedback</a></span>
                        <span><a href="https://github.com/tc39/proposal-record-tuple">Proposal</a></span>
                        <span><a href="https://github.com/bloomberg/record-tuple-polyfill">Polyfill</a></span>
                    </div>
                </div>
                <div className="editorWrapper">
                    {!this.state.showOutput ?
                        (<MonacoEditor
                            options={this.editorOptions}
                            value={this.value}
                            editorDidMount={this.onEditorMounted}
                            onChange={this.onChange} />) : null}
                    {this.state.showOutput ?
                        (<MonacoEditor
                            ref={this.outputEditor}
                            options={this.outputOptions}
                            value={this.state.output} />) : null}
                </div>
                <div className="console">
                    {this.state.isError ? 
                        (<MonacoEditor
                            options={this.errorOptions}
                            value={this.state.output} />) :
                        this.state.logs.map((l, i) =>
                            <ObjectInspector key={i} theme="chromeDark" data={l.data.length === 1 ? l.data[0] : l.data}/>)}
                </div>
            </div>
        );
    }

    onEditorMounted(editor, monaco) {
        console.log("editor mounted");
        this.update();
    }

    onChange(newValue) {
        this.value = newValue;
        this.update();
    }

    onSyntaxChange(event) {
        const syntax = event.target.value;

        this.value = syntax === "hash" ? DEFAULT_HASH : DEFAULT_BAR;
        this.setState({
            syntax,
            output: "",
        }, () => {
            this.update();
        });
    }

    onToggleShowOutput() {
        this.setState({
            showOutput: !this.state.showOutput,
        });
    }

    update() {
        this.transform(this.value, (err, result) => {
            const output = err ? err.toString() : result;
            const isError = Boolean(err);
            this.setState({ isError, output, logs: [], }, () => {
                if (this.outputEditor.current) {
                    this.outputEditor.current.editor.setSelection({
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: 1,
                    });
                }
                if (!err) {
                    this.run();
                }
                this.updateHash();
            });
        });
    }

    updateHash() {
        const content = this.value;
        const syntax = this.state.syntax;
        const data = { content, syntax };
        const json = JSON.stringify(data);
        const hash = btoa(json);
        console.log("updating hash with new state " + hash);
        window.location.hash = hash; 
    }

    transform(code, callback) {
        compile(code, this.state.syntax, callback);
    }

    run() {
        this.iframe?.remove();

        this.iframe = document.createElement("iframe");
        this.iframe.src = "./runner/index.html";
        this.iframe.onload = () =>
            this.iframe.contentWindow.run(this.state.output, this.fakeConsole);

        document.body.appendChild(this.iframe);
    }
}

const hash = window.location.hash;
console.log("loading from hash " + hash);
let content = DEFAULT_HASH;
let syntax = "hash";

try {
    if (hash) {
        const json = atob(hash.slice(1));
        const data = JSON.parse(json);

        content = data.content || content;
        syntax = data.syntax || syntax;
        console.log("loading content: " + content);
        console.log("loading syntax: " + syntax);
    }
} catch (e) {
    console.error(e);
}
render(
    <App content={content} syntax={syntax} />,
    document.getElementById("root"),
);
