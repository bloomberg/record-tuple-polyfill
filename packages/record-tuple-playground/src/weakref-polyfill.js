/* global window */
import {
    WeakRef as WRShim,
    FinalizationGroup as FGShim,
} from "@ungap/weakrefs";
if (!window.WeakRef) {
    window.WeakRef = WRShim;
    window.FinalizationGroup = FGShim;
    window.POLYFILLED_WEAKREF = true;
}

// no exports: side effects
