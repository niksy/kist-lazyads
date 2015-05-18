var $ = require('jquery');
var filter = require('array-filter');
var meta = require('./meta');
var Banner = require('./banner');
var Banners = require('./banners');
var Context = require('./context');

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
 * @param  {jQuery} $el
 *
 * @return {Banner[]}
 */
function getBanners ( $el ) {

	var banners = $.map($el, $.proxy(function ( el ) {
		var $el = $(el);
		return new Banner($el.data(this.options.contentIdDataProp), $el, this.options.classes, this.options.emptyContentFilter);
	}, this));

	// Initialize empty content banners
	$.each(this.options.content, function ( name, val ) {
		var banner = filter(banners, function ( banner ) {
			return banner.name === name;
		})[0];
		if ( banner.emptyContentFilter(val) ) {
			banner.write(val);
		}
	});

	return banners;
}

/**
 * @class
 *
 * @param  {Object} options
 */
var Lazyads = module.exports = function ( options ) {

	this.options = $.extend(true, {}, this.defaults, options);

	if ( !hasNecessaryData(this.options) ) {
		return this;
	}

	if ( !('matchMedia' in global) ) {
		$.error('window.matchMedia undefined.');
	}

	this.banners = new Banners(getBanners.call(this, $(this.options.el)), this.options);
	this.context = new Context(this.banners, this.options.context);

};

Lazyads.prototype.defaults = {
	el: '[data-ad-id]',
	context: {},
	content: {},
	contentIdDataProp: 'ad-id',

	/**
	 * @param  {String}  content
	 *
	 * @return {Boolean}
	 */
	emptyContentFilter: function ( content ) {
		return $.trim(content) === '';
	},

	classes: {
		el: meta.ns.htmlClass + '-item',
		isLoaded: 'is-loaded',
		isHidden: 'is-hidden',
		isContentEmpty: 'is-contentEmpty'
	}
};

/**
 * @param  {Function} cb
 *
 * @return {Lazyads}
 */
Lazyads.prototype.init = function ( cb ) {
	cb = cb || $.noop;
	if ( hasNecessaryData(this.options) && !this.active ) {
		this.active = true;
		this.context.init();
		cb.call(this.options);
	}
	return this;
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
Lazyads.prototype.recheckControl = function () {
	if ( hasNecessaryData(this.options) ) {
		$.each(this.banners, $.proxy(function ( index, banner ) {
			this.banners.control.resolve(banner);
		}, this));
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
		this.active = false;
	}
	return this;
};
