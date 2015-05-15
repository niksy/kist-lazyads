var $ = require('jquery');
var postscribe = require('krux-postscribe');
var meta = require('./meta');

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
	this.show();
	this.isLoaded = true;
	this.isContentEmpty = true;
	cb.call(null, this.$el);
}

/**
 * @param  {String} name
 * @param  {jQuery} el
 * @param  {Object} classes
 * @param  {Function} emptyContentFilter
 */
var Banner = module.exports = function ( name, el, classes, emptyContentFilter ) {
	this.name = name;
	this.$el = el;
	this.classes = classes;
	this.emptyContentFilter = emptyContentFilter;
	this.isLoaded = false;
	this.isContentEmpty = true;
	this.stylesheets = [];

	this.$el.addClass(this.classes.el);
};

Banner.prototype.show = function () {
	this.$el.removeClass(this.classes.isHidden);
};

Banner.prototype.hide = function () {
	this.$el.addClass(this.classes.isHidden);
};

Banner.prototype.setAsLoaded = function () {
	this.$el.addClass(this.classes.isLoaded);
};

Banner.prototype.setAsContentEmpty = function () {
	this.$el.addClass(this.classes.isContentEmpty);
};

/**
 * @param  {String}   content
 * @param  {Function} cb
 */
Banner.prototype.write = function ( content, cb ) {

	// If zone content is empty (or doesn’t exist, e.g. ad blocker is active),
	// we don't want to display it
	if ( Boolean(this.emptyContentFilter.call(this.$el[0], content)) ) {
		this.$el.html(content);
		successEmpty.call(this, cb);
		return;
	}

	// If zone content doesn't need postscribe parse (and won't benefit from
	// it's modifications), just dump it to the page
	if ( /responsive_google_ad/.test(content) ) {
		this.$el.html(content);
		success.call(this, cb);
		return;
	}

	// If zone content has external stylesheets, append them for IE 8
	if ( content.match(/link.+href/) && (document.all && !document.addEventListener) ) {
		$(content).filter('link').each($.proxy(function ( index, link ) {
			var $stylesheet = $('<link rel="stylesheet" href="' + $(link).attr('href') + '" class="' + meta.ns.htmlClass + '-ieStyle" />');
			$stylesheet.appendTo('head');
			this.stylesheets.push($stylesheet);
		}, this));
	}

	postscribe(this.$el, content, $.proxy(success, this, cb));

};

Banner.prototype.destroy = function () {
	this.$el.removeClass([this.classes.el, this.classes.isHidden, this.classes.isLoaded].join(' '));
	$.each(this.stylesheets, function ( index, stylesheet ) {
		stylesheet.remove();
	});
};
