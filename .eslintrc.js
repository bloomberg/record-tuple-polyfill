module.exports = {
    plugins: ["prettier", "jest"],
    extends: [
        "eslint:recommended",
        "prettier",
        "plugin:jest/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
    },
    rules: {
        "prettier/prettier": "error"
    },
    env: {
        "node": true,
        "jest/globals": true,
        "es6": true,
        "es2017": true,
        "es2020": true
    },
    globals: {
        "globalThis": "readonly",
        "WeakRef": "readonly",
        "FinalizationGroup": "readonly"
    }
};
