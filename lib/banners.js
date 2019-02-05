import $ from 'jquery';
import unique from 'mout/array/unique';
import filter from 'mout/array/filter';
import Banner from './banner';
import Control from './control';

/**
 * @param  {Object} contexts
 *
 * @return {Array}
 */
function getBannersFromContexts ( contexts ) {
	var unfiltered = [];
	$.each(contexts, function ( name, val ) {
		unfiltered = unfiltered.concat(val);
	});
	return unique(unfiltered);
}

/**
 * @param  {jQuery|Element} el
 * @param  {Object} options
 */
function Banners ( el, options ) {

	this.options = options;
	this.control = new Control();
	this.list = getBannersFromContexts(options.context);

	this.add(this.createBanners($(el)));
	this.options.adapter.onBannersInit(this.banners);

}

/**
 * @param  {jQuery} $el
 *
 * @return {Banner[]}
 */
Banners.prototype.createBanners = function ( $el ) {

	// Get existing banner names
	var existingBannerNames = $.map(this.banners || [], function ( banner ) {
		return banner.name;
	});

	// Filter only new banners (not already added to collection)
	var $newEl = $el.filter($.proxy(function ( index, el ) {
		var $el = $(el);
		return $.inArray($el.data(this.options.contentIdDataProp), existingBannerNames) === -1;
	}, this));

	// Create Banner instances based on new banner elements
	var banners = $.map($newEl, $.proxy(function ( el ) {
		var $el = $(el);
		return new Banner($el.data(this.options.contentIdDataProp), $el, this.options.classes, this.options.adapter);
	}, this));

	return banners;

};

/**
 * @param  {Banner[]} banners
 *
 * @return {Banner[]}
 */
Banners.prototype.add = function ( banners ) {

	banners = banners || [];

	this.banners = (this.banners || []).concat(banners);

	return banners;

};

/**
 * @param  {String[]} arr
 * @param  {Function} cb
 *
 * @return {Banner[]}
 */
Banners.prototype.get = function ( arr, cb ) {

	var banners = [];
	cb = cb || function () {
		return true;
	};

	banners = filter(this.banners, function ( banner ) {
		return $.inArray(banner.name, arr) !== -1;
	});

	return filter(banners, cb);

};

/**
 * @param  {String[]} arr
 */
Banners.prototype.show = function ( arr ) {

	var banners = this.get(arr);

	$.each(banners, $.proxy(function ( index, banner ) {
		if ( banner.isContentEmpty ) {
			banner.hide();
		} else {
			banner.show();
		}
		this.control.resolve(banner);
	}, this));

};

/**
 * @param  {String[]} arr
 */
Banners.prototype.hide = function ( arr ) {

	var banners = this.get(arr);

	$.each(banners, $.proxy(function ( index, banner ) {
		banner.hide();
		this.control.resolve(banner);
	}, this));

};

/**
 * @param  {String[]} arr
 */
Banners.prototype.write = function ( arr ) {

	var banners = this.get(arr, function ( banner ) {
		return !banner.isLoaded;
	});

	this.options.adapter.beforeBannersWrite(banners);

	$.each(banners, $.proxy(function ( index, banner ) {

		banner.write($.proxy(function () {
			if ( banner.isContentEmpty ) {
				this.hide([banner.name]);
			} else {
				this.show([banner.name]);
			}
		}, this));

	}, this));

	this.options.adapter.afterBannersWrite(banners);

};

Banners.prototype.destroy = function () {
	$.each(this.banners, function ( index, banner ) {
		banner.destroy();
	});
	this.control.destroy();
};

export default Banners;
