import $ from 'jquery';
import postscribe from 'postscribe';
import meta from '../lib/meta';

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
	this.isLoaded = true;
	this.isContentEmpty = true;
	cb.call(null, this.$el);
}

function Adapter () {
	this.content = window.OA_output;
}

Adapter.prototype.onBannersInit = function ( banners ) {};
Adapter.prototype.beforeBannersWrite = function ( banners ) {};
Adapter.prototype.afterBannersWrite = function ( banners ) {};

/**
 * @param  {Banner}   banner
 * @param  {Function} cb
 */
Adapter.prototype.writeBannerContent = function ( banner, cb ) {

	var bannerCtx = banner;
	var content = this.content[bannerCtx.name];
	cb = cb || $.noop;

	/*
	 * If ad content is empty (or doesn’t exist, e.g. ad blocker is active),
	 * we don't want to display it
	 */
	if ( this.isResponseEmpty(content) ) {
		bannerCtx.$el.html(content);
		successEmpty.call(bannerCtx, cb);
		return;
	}

	/*
	 * If ad content doesn't need postscribe parse (and won't benefit from
	 * it's modifications), just dump it to the page
	 */
	if ( /responsive_google_ad/.test(content) ) {
		bannerCtx.$el.html(content);
		success.call(bannerCtx, cb);
		return;
	}

	// If ad content has external stylesheets, append them for IE 8
	if ( content.match(/link.+href/) && (document.all && !document.addEventListener) ) {
		$(content).filter('link').each($.proxy(function ( index, link ) {
			var $stylesheet = $(`<link rel="stylesheet" href="${$(link).attr('href')}" class="${meta.ns.htmlClass}-ieStyle" />`);
			$stylesheet.appendTo('head');
			bannerCtx.stylesheets.push($stylesheet);
		}, bannerCtx));
	}

	bannerCtx.$el.empty();
	postscribe(bannerCtx.$el, content, {
		done: $.proxy(success, bannerCtx, cb)
	});

};

/**
 * Banner response is considered empty if it returns (trimmed) empty string for its content.
 * It should return `true` if content is empty.
 *
 * @param  {Mixed} content
 *
 * @return {Boolean}
 */
Adapter.prototype.isResponseEmpty = function ( content ) {
	if ( typeof content === 'string' ) {
		return content.trim() === '' || /bannerid=0&amp;campaignid=0/.test(content);
	}
	return false;
};

export default Adapter;
