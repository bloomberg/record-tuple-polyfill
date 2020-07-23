/* global window */
import {
    WeakRef as WRShim,
    FinalizationGroup as FGShim,
} from "@ungap/weakrefs";

export const POLYFILLED_WEAKREF = !window.WeakRef;

if (POLYFILLED_WEAKREF) {
    window.WeakRef = WRShim;
    window.FinalizationGroup = FGShim;
}
