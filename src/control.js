var $ = require('jquery');
var waitForLayout = require('./util/wait-for-layout');

/**
 * @param  {jQuery} el
 * @param  {String} controlName
 *
 * @return {Function}
 */
function emit ( el, controlName ) {

	/**
	 * @param  {String} eventName
	 */
	return function ( eventName ) {
		el.trigger(eventName + ':' + controlName, [el]);
	};
}

/**
 * @class
 *
 * @return {Control}
 */
var Control = module.exports = function () {
	this.list = [];
};

/**
 * @type {Object}
 */
Control.prototype.defaults = {
	name: '',
	condition: function () {
		return true;
	},
	callback: $.noop
};

/**
 * @param {Object} props
 */
Control.prototype.add = function ( props ) {

	var list = this.list;
	var push = true;

	$.each(list, function ( index, val ) {
		if ( val.name === props.name ) {
			$.extend(val, props);
			push = false;
			return false;
		}
	});

	if ( push ) {
		list.push($.extend({}, this.defaults, props));
	}

};

/**
 * @param  {jQuery} el
 *
 * @return {}
 */
Control.prototype.resolve = function ( el ) {

	var arr = this.list;
	var val;

	el.each(function () {
		var item = $(this);

		$.each(arr, $.proxy(function ( index, val ) {
			if ( Boolean(val.condition.call(this, item)) ) {
				val.callback.call(this, item, emit(item, val.name), waitForLayout);
			}
		}, this));

	});

};

Control.prototype.destroy = function () {
	this.list = [];
};
