var $ = require('jquery');

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
 * @param  {Object} ctx
 *
 * @return {Function}
 */
function waitForLayout ( ctx ) {

	/**
	 * Some banners report incorrect size so we have to take render time difference.
	 *
	 * @param  {Function} cb
	 * @param  {Number} pTimeout
	 */
	return function ( cb, timeout ) {
		setTimeout($.proxy(cb, ctx), timeout || 300);
	};
}

/**
 * @class
 *
 * @return {Control}
 */
var Control = module.exports = function () {
	this.controls = [];
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

	var controls = this.controls;
	var push = true;

	$.each(controls, function ( index, control ) {
		if ( control.name === props.name ) {
			$.extend(control, props);
			push = false;
			return false;
		}
	});

	if ( push ) {
		controls.push($.extend({}, this.defaults, props));
	}

};

/**
 * @param  {Banner} banner
 */
Control.prototype.resolve = function ( banner ) {

	var controls = this.controls;
	var $banner = banner.$el;

	$.each(controls, $.proxy(function ( index, control ) {
		if ( Boolean(control.condition.call($banner[0], $banner)) ) {
			control.callback.call($banner[0], $banner, emit($banner, control.name), waitForLayout(this));
		}
	}, this));

};

Control.prototype.destroy = function () {
	this.controls = [];
};
