var $ = require('jquery');
var unique = require('array-uniq');
var filter = require('array-filter');
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
 * @param  {Banner[]} el
 * @param  {Object} options
 */
var Banners = module.exports = function ( banners, options ) {

	this.banners = banners;
	this.content = options.content;
	this.control = new Control();
	this.list = getBannersFromContexts(options.context);
	this.contentEmptyList = [];

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

	$.each(banners, $.proxy(function ( index, banner ) {

		banner.write(this.content[banner.name], $.proxy(function () {
			if ( banner.isContentEmpty ) {
				this.contentEmptyList.push(banner.name);
			} else {
				this.show([banner.name]);
			}
		}, this));

	}, this));

};

Banners.prototype.destroy = function () {
	$.each(this.banners, function ( index, banner ) {
		banner.destroy();
	});
	this.control.destroy();
};
