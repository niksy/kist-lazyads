var $ = require('jquery');
var unique = require('mout/array/unique');
var filter = require('mout/array/filter');
var Banner = require('./banner');
var Control = require('./control');

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
var Banners = module.exports = function ( el, options ) {

	this.options = options;
	this.content = options.content;
	this.control = new Control();
	this.list = getBannersFromContexts(options.context);

	this.add(this.createBanners($(el)));
	this.options.adapter.onBannersInit(this.banners);

};

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
		return new Banner($el.data(this.options.contentIdDataProp), $el, this.options.classes, this.options.alreadyLoadedFilter, this.options.adapter);
	}, this));

	// Initialize empty content banners
	$.each(this.content, $.proxy(function ( name, val ) {

		var banner = filter(banners, function ( banner ) {
			return banner.name === name;
		})[0];

		// If banner element for that ad actually exists on page and has empty content
		if ( banner && this.options.adapter.isResponseEmpty(val) ) {
			banner.write(val);
		}

	}, this));

	// Set state for already loaded banners
	$.each(banners, function ( index, banner ) {
		banner.resolveAlreadyLoadedState();
	});

	return banners;

};

/**
 * @param  {Banner[]} banners
 *
 * @return {Banner[]}
 */
Banners.prototype.add = function ( banners ) {

	var contentEmptyList = [];
	banners = banners || [];

	// Get empty content banners
	contentEmptyList = filter(banners, function ( banner ) {
		return banner.isLoaded && banner.isContentEmpty;
	});
	contentEmptyList = $.map(contentEmptyList, function ( banner ) {
		return banner.name;
	});

	this.banners = (this.banners || []).concat(banners);
	this.contentEmptyList = (this.contentEmptyList || []).concat(contentEmptyList);

	return banners;

};

/**
 * Get banners with non-empty content
 *
 * @param  {String[]} arr
 *
 * @return {String[]}
 */
Banners.prototype.filterContentNonEmpty = function ( arr ) {
	return filter(arr, $.proxy(function ( val ) {
		return $.inArray(val, this.contentEmptyList) === -1;
	}, this));
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
		banner.show();
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
		return !banner.isLoaded && banner.isContentEmpty;
	});

	this.options.adapter.beforeBannersWrite(banners);

	$.each(banners, $.proxy(function ( index, banner ) {

		banner.write(this.content[banner.name], $.proxy(function () {
			if ( banner.isLoaded && banner.isContentEmpty ) {
				this.contentEmptyList.push(banner.name);
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
