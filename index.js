import $ from 'jquery';
import meta from './lib/meta';
import Banners from './lib/banners';
import Context from './lib/context';

/**
 * @class
 *
 * @param  {Object} options
 */
function Lazyads ( options ) {

	this.options = $.extend(true, {}, this.defaults, options);

	if ( !this.options.adapter.hasNecessaryInitData(this.options) ) {
		return this;
	}

	if ( !('matchMedia' in global) ) {
		$.error('window.matchMedia undefined.');
	}

	this.banners = new Banners(this.options.el, this.options);
	this.context = new Context(this.banners, this.options.context);

}

Lazyads.prototype.defaults = {
	el: '[data-ad-id]',
	context: {},
	contentIdDataProp: 'ad-id',
	adapter: null,
	classes: {
		el: `${meta.ns.htmlClass}-item`,
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
	var banners, list;
	if ( this.options.adapter.hasNecessaryInitData(this.options) ) {
		banners = this.banners.add(this.banners.createBanners($(el)));
		list = $.map(banners, function ( banner ) {
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

export default Lazyads;
