# @bloomberg/babel-plugin-polyfill-record-tuple

## Install

Using npm:

```sh
npm install --save-dev @bloomberg/babel-plugin-polyfill-record-tuple
```

or using yarn:

```sh
yarn add @bloomberg/babel-plugin-polyfill-record-tuple --dev
```

## Usage

This package respects the [Babel polyfill plugin API](https://github.com/babel/babel-polyfills).

Add this plugin to your Babel configuration:

```json
{
  "plugins": [["@bloomberg/polyfill-record-tuple", { "method": "usage-global" }]]
}
```

This package supports the `usage-pure` and `usage-global`.