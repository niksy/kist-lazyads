'use strict';

const babel = require('rollup-plugin-babel');

module.exports = [{
	input: 'index.js',
	output: [
		{
			file: 'index.cjs.js',
			format: 'cjs'
		},
		{
			file: 'index.esm.js',
			format: 'esm'
		}
	],
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]
}, {
	input: 'adapters/revive-ads.js',
	output: [
		{
			file: 'adapters/revive-ads.cjs.js',
			format: 'cjs'
		},
		{
			file: 'adapters/revive-ads.esm.js',
			format: 'esm'
		}
	],
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]
}, {
	input: 'context/media-query.js',
	output: [
		{
			file: 'context/media-query.cjs.js',
			format: 'cjs'
		},
		{
			file: 'context/media-query.esm.js',
			format: 'esm'
		}
	],
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]
}];
