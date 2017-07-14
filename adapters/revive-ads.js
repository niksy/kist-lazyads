var $ = require('jquery');
var postscribe = require('krux-postscribe');
var meta = require('../lib/meta');

/**
 * @param  {Function} cb
 */
function success ( cb ) {
	this.setAsLoaded();
	this.isLoaded = true;
	this.isContentEmpty = false;
	cb.call(null, this.$el);
}

/**
 * @param  {Function} cb
 */
function successEmpty ( cb ) {
	this.setAsContentEmpty();
	this.hide();
	this.isLoaded = true;
	this.isContentEmpty = true;
	cb.call(null, this.$el);
}

var Adapter = module.exports = function () {};

Adapter.prototype.onBannersInit = function ( banners ) {};
Adapter.prototype.afterBannersWrite = function ( banners ) {};

/**
 * @param  {Banner}   banner
 * @param  {String}   content
 * @param  {Function} cb
 */
Adapter.prototype.writeBannerContent = function ( banner, content, cb ) {

	var bannerCtx = banner;
	cb = cb || $.noop;

	// If ad content is empty (or doesn’t exist, e.g. ad blocker is active),
	// we don't want to display it
	if ( bannerCtx.emptyContentFilter(content) ) {
		bannerCtx.$el.html(content);
		successEmpty.call(bannerCtx, cb);
		return;
	}

	// If ad content doesn't need postscribe parse (and won't benefit from
	// it's modifications), just dump it to the page
	if ( /responsive_google_ad/.test(content) ) {
		bannerCtx.$el.html(content);
		success.call(bannerCtx, cb);
		return;
	}

	// If ad content has external stylesheets, append them for IE 8
	if ( content.match(/link.+href/) && (document.all && !document.addEventListener) ) {
		$(content).filter('link').each($.proxy(function ( index, link ) {
			var $stylesheet = $('<link rel="stylesheet" href="' + $(link).attr('href') + '" class="' + meta.ns.htmlClass + '-ieStyle" />');
			$stylesheet.appendTo('head');
			bannerCtx.stylesheets.push($stylesheet);
		}, bannerCtx));
	}

	bannerCtx.$el.empty();
	postscribe(bannerCtx.$el, content, $.proxy(success, bannerCtx, cb));

};

/**
 * If content object is empty, we don’t display ads, have
 * ad blocker activated, etc., don’t do anything with ad system
 *
 * @param  {Object}  options
 *
 * @return {Boolean}
 */
Adapter.prototype.hasNecessaryInitData = function ( options ) {
	if ( $.isEmptyObject(options.content) || $.isEmptyObject(options.context) ) {
		return false;
	}
	return true;
};