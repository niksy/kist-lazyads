var $ = require('jquery');
var meta = require('./src/meta');
var Banners = require('./src/banners');
var Context = require('./src/context');

/**
 *
 * If content object is empty, we don’t display ads, have
 * ad blocker activated, etc., don’t do anything with ad system
 *
 * @param  {Object}  options
 *
 * @return {Boolean}
 */
function hasNecessaryData ( options ) {
	if ( $.isEmptyObject(options.content) || $.isEmptyObject(options.context) ) {
		return false;
	}
	return true;
}

/**
 * @class
 *
 * @param  {Object} options
 */
var Lazyads = module.exports = function ( options ) {

	this.options         = $.extend({}, this.defaults, options);
	this.options.classes = $.extend({}, this.defaults.classes, options.classes);

	if ( !hasNecessaryData(this.options) ) {
		return this;
	}

	if ( !('matchMedia' in global) ) {
		$.error('window.matchMedia undefined.');
	}

	this.banners = new Banners($(this.options.el), this.options);
	this.context = new Context(this.banners, this.options.context);

	this.options.init();

};

Lazyads.prototype.defaults = {
	el: '[data-ad-id]',
	context: {},
	content: {},
	init: $.noop,
	contentIdDataProp: 'ad-id',
	classes: {
		el: meta.ns.htmlClass + '-item',
		isLoaded: 'is-loaded',
		isHidden: 'is-hidden'
	}
};

/**
 * @param  {Object} props
 *
 * @return {Lazyads}
 */
Lazyads.prototype.control = function ( props ) {
	if ( hasNecessaryData(this.options) ) {
		this.banners.control.add(props);
	}
	return this;
};

/**
 * @return {Lazyads}
 */
Lazyads.prototype.destroy = function () {
	if ( hasNecessaryData(this.options) ) {
		this.banners.destroy();
		this.context.destroy();
		this.banners = null;
		this.context = null;
	}
	return this;
};
