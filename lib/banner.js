/* jshint maxparams:false */

var $ = require('jquery');

/**
 * @param  {String} name
 * @param  {jQuery} el
 * @param  {Object} classes
 * @param  {Function} emptyContentFilter
 * @param  {Function} alreadyLoadedFilter
 * @param  {Object} adapter
 */
var Banner = module.exports = function ( name, el, classes, emptyContentFilter, alreadyLoadedFilter, adapter ) {

	if ( !name ) {
		throw new Error('Ad name is not provided.');
	}
	if ( !el ) {
		throw new Error('Ad placeholder element is not provided.');
	}

	this.name = name;
	this.$el = el;
	this.classes = classes;
	this.isLoaded = false;
	this.isContentEmpty = true;
	this.stylesheets = [];

	// This should probably be defined as prototype method
	this.emptyContentFilter = function () {
		return Boolean(emptyContentFilter.apply(this.$el[0], arguments));
	};
	this.alreadyLoadedFilter = function () {
		return Boolean(alreadyLoadedFilter.apply(this.$el[0], arguments));
	};
	this.write = $.proxy(adapter.writeBannerContent, this);

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

Banner.prototype.destroy = function () {
	this.$el.removeClass([this.classes.el, this.classes.isHidden, this.classes.isLoaded].join(' '));
	$.each(this.stylesheets, function ( index, stylesheet ) {
		stylesheet.remove();
	});
};
