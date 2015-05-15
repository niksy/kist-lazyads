var $ = require('jquery');
var difference = require('arr-diff');
var filter = require('array-filter');

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
		this.calculate();
	}
	if ( !isAnyContextActive(this.contexts) ) {
		this.banners.hide(this.banners.filterContentNonEmpty(this.banners.list));
	}
}

/**
 * @param  {Object} contexts
 *
 * @return {String[]}
 */
function getVisibleBanners ( contexts ) {
	var arr = [];
	$.each(contexts, function ( name, context ) {
		if ( context.mq.matches ) {
			arr = arr.concat(context.zones);
		}
	});
	return arr;
}

/**
 * @class
 *
 * @param  {Banners} banners
 * @param  {Object} rawContexts
 */
var Context = module.exports = function ( banners, rawContexts ) {

	this.banners = banners;
	this.contexts = this.transformContexts(rawContexts);

};

Context.prototype.init = function () {
	this.listen();
	this.calculate();
};

/**
 * @param  {Object} rawContexts
 *
 * @return {Object}
 */
Context.prototype.transformContexts = function ( rawContexts ) {

	var ret = {};
	var gmm = $.proxy(this.getMatchMedia, this);

	$.each(rawContexts, function ( mq, zones ) {
		ret[mq] = {
			context: mq,
			mq: gmm(mq),
			zones: zones
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

Context.prototype.calculate = function () {

	var list = this.banners.filterContentNonEmpty(this.banners.list);
	var visibleBanners = this.banners.filterContentNonEmpty(getVisibleBanners(this.contexts));

	this.banners.hide(difference(list, visibleBanners));
	this.banners.show(visibleBanners);
	this.banners.write(visibleBanners);

};

Context.prototype.destroy = function () {
	this.unlisten();
	this.contexts = {};
};
