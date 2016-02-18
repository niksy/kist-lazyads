var assert = require('assert');
var Control = require('../../lib/control');

describe('', function () {

	it('should be function', function () {
		assert.equal(typeof(Control), 'function');
	});

	it('should add props', function () {

		var c = new Control();

		c.add({name:'foo'});
		c.add({name:'bar'});

		assert.equal(c.controls.length, 2);
		assert.deepEqual(c.controls, [
			$.extend({}, Control.prototype.defaults, {name: 'foo'}),
			$.extend({}, Control.prototype.defaults, {name: 'bar'})
		]);

	});

	it('should merge props with same name', function () {

		var c = new Control();

		c.add({name:'foo'});
		c.add({name:'foo', callback: 1});
		c.add({name:'foo', callback: 2});

		assert.equal(c.controls.length, 1);
		assert.deepEqual(c.controls, [
			$.extend({}, Control.prototype.defaults, {name: 'foo', callback: 2})
		]);

	});

});
