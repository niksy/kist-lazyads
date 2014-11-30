var assert = require('assert');
var Control = require('../../src/control');

describe('', function () {

	it('should be function', function () {
		assert.equal(typeof(Control), 'function');
	});

	it('should add props', function () {

		var c = new Control();

		c.add({name:'foo'});
		c.add({name:'bar'});

		assert.equal(c.list.length, 2);
		assert.deepEqual(c.list, [
			$.extend({}, Control.prototype.defaults, {name: 'foo'}),
			$.extend({}, Control.prototype.defaults, {name: 'bar'})
		]);

	});

	it('should merge props with same name', function () {

		var c = new Control();

		c.add({name:'foo'});
		c.add({name:'foo', callback: 1});
		c.add({name:'foo', callback: 2});

		assert.equal(c.list.length, 1);
		assert.deepEqual(c.list, [
			$.extend({}, Control.prototype.defaults, {name: 'foo', callback: 2})
		]);

	});

	it('should trigger event when properly resolved', function () {

		var c = new Control();
		var el = $({});
		var spy = 0;

		c.add({
			name:'foo',
			callback: function ( el, emit ) {
				emit('done');
				spy++;
			}
		});

		el.on('done:foo', function ( e, el ) {
			spy++;
		});

		c.resolve(el);

		assert.equal(spy, 2);

	});

});
