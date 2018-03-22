/* jshint maxparams:false */

var $ = require('jquery');

/**
 * @param  {String} name
 * @param  {jQuery} el
 * @param  {Object} classes
 * @param  {Function} alreadyLoadedFilter
 * @param  {Object} adapter
 */
var Banner = module.exports = function ( name, el, classes, alreadyLoadedFilter, adapter ) {

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
	this.adapter = adapter;

	this.alreadyLoadedFilter = function () {
		return Boolean(alreadyLoadedFilter.apply(this.$el[0], arguments));
	};

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
	this.adapter.writeBannerContent(this, content, cb);
};

Banner.prototype.destroy = function () {
	this.$el.removeClass([this.classes.el, this.classes.isHidden, this.classes.isLoaded].join(' '));
	$.each(this.stylesheets, function ( index, stylesheet ) {
		stylesheet.remove();
	});
};
