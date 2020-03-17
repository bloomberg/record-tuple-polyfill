"use strict";

var _Tuple = require("@bloomberg/record-tuple-polyfill").Tuple;

var _Record = require("@bloomberg/record-tuple-polyfill").Record;

const r1 = _Record({
  a: 1,
  b: 2,
  c: 3
});

const r2 = _Record({
  a: _Record({
    b: _Record({
      c: 123
    }),
    d: 456
  }),
  e: 789
});

const t1 = _Tuple();

const t2 = _Tuple(1, 2, 3);

const t3 = _Tuple(1, _Tuple(2, 3, _Tuple(4), 5), 6);
