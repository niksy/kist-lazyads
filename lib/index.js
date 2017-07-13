var $ = require('jquery');
var meta = require('./meta');
var Banners = require('./banners');
var Context = require('./context');
var ReviveAdsAdapter = require('../adapters/revive-ads');

/**
 * @class
 *
 * @param  {Object} options
 */
var Lazyads = module.exports = function ( options ) {

	this.options = $.extend(true, {}, this.defaults, options);

	if ( this.options.adapter === null ) {
		this.options.adapter = new ReviveAdsAdapter();
	}

	if ( !this.options.adapter.hasNecessaryInitData(this.options) ) {
		return this;
	}

	if ( !('matchMedia' in global) ) {
		$.error('window.matchMedia undefined.');
	}

	this.banners = new Banners(this.options.el, this.options);
	this.context = new Context(this.banners, this.options.context);

};

Lazyads.prototype.defaults = {
	el: '[data-ad-id]',
	context: {},
	content: {},
	contentIdDataProp: 'ad-id',
	adapter: null,

	/**
	 * @param  {jQuery} $el
	 *
	 * @return {Boolean}
	 */
	alreadyLoadedFilter: function ( $el ) {
		return false;
	},

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
	if ( this.options.adapter.hasNecessaryInitData(this.options) && !this.active ) {
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
	if ( this.options.adapter.hasNecessaryInitData(this.options) ) {
		this.banners.control.add(props);
	}
	return this;
};

/**
 * @return {Lazyads}
 */
Lazyads.prototype.recheckControl = function () {
	if ( this.options.adapter.hasNecessaryInitData(this.options) ) {
		$.each(this.banners, $.proxy(function ( index, banner ) {
			this.banners.control.resolve(banner);
		}, this));
	}
	return this;
};

/**
 * @param {jQuery|Element} el
 *
 * @return {Lazyads}
 */
Lazyads.prototype.addPlaceholder = function ( el ) {
	if ( this.options.adapter.hasNecessaryInitData(this.options) ) {
		var banners = this.banners.add(this.banners.createBanners($(el)));
		var list = $.map(banners, function ( banner ) {
			return banner.name;
		});
		this.context.calculate(list);
	}
	return this;
};

/**
 * @return {Lazyads}
 */
Lazyads.prototype.destroy = function () {
	if ( this.options.adapter.hasNecessaryInitData(this.options) ) {
		this.banners.destroy();
		this.context.destroy();
		this.banners = null;
		this.context = null;
		this.active = false;
	}
	return this;
};
