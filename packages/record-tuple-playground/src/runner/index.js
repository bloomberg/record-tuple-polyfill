/* globals btoa */

import { POLYFILLED_WEAKREF } from "./weakref-polyfill.js";
import "@bloomberg/record-tuple-polyfill/modify-global";

const NO_NATIVE_WEAKREF_ERROR =
    "WeakMap, WeakRef, and FinalizationRegistry are required for the Record and Tuple playground\n\n" +
    "We enabled a shim that will leak memory that reproduces those features.\n\n" +
    "To enable these experimental features natively, go to:\n  https://github.com/bloomberg/record-tuple-polyfill#playground";

globalThis.run = function(source, console, parentConsole) {
    globalThis.console = console;

    if (POLYFILLED_WEAKREF) {
        console.error(NO_NATIVE_WEAKREF_ERROR);
    }

    const encodedJs = btoa(source);

    const dataUri = "data:text/javascript;base64," + encodedJs;
    return import(/*webpackIgnore: true*/ dataUri).catch(e => {
        console.error(e.message);
        console.error(e);
        parentConsole.error(e);
    });
};
