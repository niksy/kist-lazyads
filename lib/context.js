var $ = require('jquery');
var intersection = require('mout/array/intersection');
var difference = require('mout/array/difference');

/**
 * @param  {Object}  contexts
 *
 * @return {Boolean}
 */
function isAnyContextActive ( contexts ) {
	var bool = false;
	$.each(contexts, function ( name, val ) {
		if ( val.mq.matches ) {
			bool = true;
			return false;
		}
	});
	return bool;
}

/**
 * @param  {MediaQueryList} mq
 */
function listener ( mq ) {
	if ( mq.matches ) {
		this.calculate(this.banners.list);
	}
	if ( !isAnyContextActive(this.contexts) ) {
		this.banners.hide(this.banners.filterContentNonEmpty(this.banners.list));
	}
}

/**
 * @param  {Banners} banners
 * @param  {Object} rawContexts
 */
var Context = module.exports = function ( banners, rawContexts ) {

	this.banners = banners;
	this.contexts = this.transformContexts(rawContexts);

};

Context.prototype.init = function () {
	this.listen();
	this.calculate(this.banners.list);
};

/**
 * @param  {Object} rawContexts
 *
 * @return {Object}
 */
Context.prototype.transformContexts = function ( rawContexts ) {

	var ret = {};
	var gmm = $.proxy(this.getMatchMedia, this);

	$.each(rawContexts, function ( mq, ads ) {
		ret[mq] = {
			context: mq,
			mq: gmm(mq),
			ads: ads
		};
	});

	return ret;
};

/**
 * @param {String} context
 *
 * @return {MediaQueryList}
 */
Context.prototype.getMatchMedia = function ( context ) {
	return global.matchMedia(context);
};

Context.prototype.listen = function () {

	$.each(this.contexts, $.proxy(function ( name, val ) {
		val._listener = $.proxy(listener, this);
		val.mq.addListener(val._listener);
	}, this));

};

Context.prototype.unlisten = function () {

	$.each(this.contexts, function ( name, val ) {
		val.mq.removeListener(val._listener);
	});

};

/**
 * @param  {String[]} rawList
 */
Context.prototype.calculate = function ( rawList ) {

	var nonEmpty = $.proxy(this.banners.filterContentNonEmpty, this.banners);

	var allList = nonEmpty(this.banners.list);
	var allVisibleBanners = nonEmpty(this.getVisibleBanners());
	var allHiddenBanners = difference(allList, allVisibleBanners);

	var list = nonEmpty(rawList);
	var visibleBanners = intersection(allVisibleBanners, list);
	var hiddenBanners = difference(list, visibleBanners);

	this.banners.hide(hiddenBanners);
	this.banners.show(visibleBanners);
	this.banners.write(visibleBanners);

};

/**
 * @return {String[]}
 */
Context.prototype.getVisibleBanners = function () {
	var arr = [];
	$.each(this.contexts, function ( name, context ) {
		if ( context.mq.matches ) {
			arr = arr.concat(context.ads);
		}
	});
	return arr;
};

Context.prototype.destroy = function () {
	this.unlisten();
	this.contexts = {};
};
