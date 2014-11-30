var $ = require('jquery');
var empty = require('is-empty');
var meta = require('./src/meta');
var Banners = require('./src/banners');
var Context = require('./src/context');

/**
 * @class
 *
 * @param  {Object} options
 */
var Lazyads = module.exports = function ( options ) {

	this.options         = $.extend({}, this.defaults, options);
	this.options.classes = $.extend({}, this.defaults.classes, options.classes);

	// If we don’t have banner content object or we don’t display banners
	// (e.g. we are in maintenance mode), don’t do anything with banner system
	if ( empty(this.options.content) || empty(this.options.context) ) {
		return;
	}

	// Don’t do anything if we don’t have `matchMedia`
	if ( !('matchMedia' in global) ) {
		$.error('window.matchMedia undefined.');
	}

	this.banners = new Banners($(this.options.selector), this.options);
	this.context = new Context(this.banners, this.options.context);

	this.options.init.call(this);

};

/**
 * @type {Object}
 */
Lazyads.prototype.defaults = {
	selector: '',
	context: {},
	content: {},
	init: $.noop,
	contentIdDataProp: 'zone-name',
	classes: {
		banner: meta.ns.htmlClass + '-item',
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
	this.banners.control.add(props);
	return this;
};

Lazyads.prototype.destroy = function () {
	this.banners.destroy();
	this.context.destroy();
	this.banners = null;
	this.context = null;
	return this;
};
