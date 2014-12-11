var $ = require('jquery');
var postscribe = require('krux-postscribe');
var unique = require('array-uniq');
var Control = require('./control');
var meta = require('./meta');

/**
 * @this   {Banners}
 *
 * @param  {String} name
 * @param  {Integer} index
 * @param  {Element} el
 *
 * @return {jQuery}
 */
function resolveByName ( name, index, el ) {
	return $(el).data(this.contentIdDataProp) === name;
}

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
 * @this   {Banners}
 *
 * @param  {jQuery} el
 */
function success ( el ) {
	el.addClass(this.classes.isLoaded);
	this.control.resolve(el);
}

/**
 * @class
 *
 * @param  {jQuery} el
 * @param  {Object} options
 */
var Banners = module.exports = function ( el, options ) {

	this.$el               = el;
	this.contentIdDataProp = options.contentIdDataProp;
	this.content           = options.content;
	this.classes           = options.classes;
	this.list              = getBannersFromContexts(options.context);
	this.control           = new Control();

	this.$el.addClass(this.classes.el);

};

/**
 * @param  {Array} arr
 * @param  {Function} filter
 *
 * @return {jQuery}
 */
Banners.prototype.get = function ( arr, filter ) {

	var el = $();
	filter = filter || function () {
		return true;
	};

	$.each(arr, $.proxy(function ( index, val ) {
		el = el.add(this.$el.filter($.proxy(resolveByName, this, val)));
	}, this));

	return el.filter(filter);

};

/**
 * @param  {Array} arr
 */
Banners.prototype.show = function ( arr ) {
	var el = this.get(arr);
	el.removeClass(this.classes.isHidden);
	this.control.resolve(el);
	this.populate(arr);
};

/**
 * @param  {Array} arr
 */
Banners.prototype.hide = function ( arr ) {
	var el = this.get(arr);
	el.addClass(this.classes.isHidden);
	this.control.resolve(el);
};

/**
 * @param  {Array} arr
 */
Banners.prototype.populate = function ( arr ) {

	var isLoaded = this.classes.isLoaded;
	var el = this.get(arr, function ( index, item ) {
		return !$(item).hasClass(isLoaded);
	});

	el.each($.proxy(function ( index, item ) {
		this.write($(item));
	}, this));

};

/**
 * @param  {jQuery} el
 */
Banners.prototype.write = function ( el ) {

	var content = this.content[el.data(this.contentIdDataProp)];

	// If zone content is empty (or doesn’t exist, e.g. ad blocker is active),
	// we don't want to display it
	if ( !Boolean(content) ) {
		return;
	}

	// If zone content doesn't need postscribe parse (and won't benefit from
	// it's modifications), just dump it to the page
	if ( /responsive_google_ad/.test(content) ) {
		el.html(content);
		success.call(this, el);
		return;
	}

	// If zone content has external links, append them for IE 8
	if ( content.match(/link.+href/) && (document.all && !document.addEventListener) ) {
		$(content).filter('link').each(function ( index, link ) {
			$('<link rel="stylesheet" href="' + $(link).attr('href') + '" class="' + meta.ns.htmlClass + '-ieStyle" />').appendTo('head');
		});
	}

	postscribe(el, content, $.proxy(success, this, el));

};

Banners.prototype.destroy = function () {
	this.$el.removeClass([this.classes.el, this.classes.isHidden, this.classes.isLoaded].join(' '));
	$('.' + meta.ns.htmlClass + '-ieStyle').remove();
	this.control.destroy();
};
