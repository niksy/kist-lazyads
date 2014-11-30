var $ = require('jquery');
var difference = require('arr-diff');

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
		this.banners.hide(this.banners.list);
	}
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

	var visibleBanners = [];

	$.each(this.contexts, function ( name, val ) {
		if ( val.mq.matches ) {
			visibleBanners = visibleBanners.concat(val.zones);
		}
	});

	this.banners.hide(difference(this.banners.list, visibleBanners));
	this.banners.show(visibleBanners);

};

Context.prototype.destroy = function () {
	this.unlisten();
	this.contexts = {};
};
