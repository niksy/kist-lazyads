import $ from 'jquery';

class Banner {

	/**
	 * @param  {String} name
	 * @param  {jQuery} el
	 * @param  {Object} classes
	 * @param  {Object} adapter
	 */
	constructor ( name, el, classes, adapter ) {

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

		this.$el.addClass(this.classes.el);
	}

	show () {
		this.$el.removeClass(this.classes.isHidden);
	}

	hide () {
		this.$el.addClass(this.classes.isHidden);
	}

	setAsLoaded () {
		this.$el.addClass(this.classes.isLoaded);
	}

	setAsContentEmpty () {
		this.$el.addClass(this.classes.isContentEmpty);
	}

	/**
	 * @param  {Function} cb
	 */
	write ( cb ) {
		this.adapter.writeBannerContent(this, cb);
	}

	destroy () {
		this.$el.removeClass([ this.classes.el, this.classes.isHidden, this.classes.isLoaded ].join(' '));
		$.each(this.stylesheets, function ( index, stylesheet ) {
			stylesheet.remove();
		});
	}

}

export default Banner;
