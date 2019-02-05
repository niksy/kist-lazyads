import $ from 'jquery';
import meta from './lib/meta';
import Banners from './lib/banners';
import Context from './lib/context';
import ContextResolver from './lib/context-resolver';

/**
 * @class
 *
 * @param  {Object} options
 */
function Lazyads ( options ) {

	this.options = $.extend(true, {}, this.defaults, options);

	this.banners = new Banners(this.options.el, this.options);

	this.contextResolver = new ContextResolver(this.banners, [
		new Context(this.options.context)
	]);

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
	this.active = true;
	this.contextResolver.resolve();
	cb.call(this.options);
	return this;
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

/**
 * @return {Lazyads}
 */
Lazyads.prototype.recheckControl = function () {
	$.each(this.banners, $.proxy(function ( index, banner ) {
		this.banners.control.resolve(banner);
	}, this));
	return this;
};

/**
 * @param {jQuery|Element} el
 *
 * @return {Lazyads}
 */
Lazyads.prototype.addPlaceholder = function ( el ) {
	var banners, list;
	banners = this.banners.add(this.banners.createBanners($(el)));
	list = $.map(banners, function ( banner ) {
		return banner.name;
	});
	this.contextResolver.resolve();
	return this;
};

/**
 * @return {Lazyads}
 */
Lazyads.prototype.destroy = function () {
	this.banners.destroy();
	this.contextResolver.destroy();
	this.banners = null;
	this.contextResolver = null;
	this.active = false;
	return this;
};

export default Lazyads;
