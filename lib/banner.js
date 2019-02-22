class Banner {

	/**
	 * @param  {String} name
	 * @param  {Element} el
	 * @param  {Object} classes
	 * @param  {Object} service
	 */
	constructor ( name, el, classes, service ) {

		if ( !name ) {
			throw new Error('Ad name is not provided.');
		}
		if ( !el ) {
			throw new Error('Ad placeholder element is not provided.');
		}

		this.name = name;
		this.el = el;
		this.classes = classes;
		this.isVisible = false;
		this.isLoaded = false;
		this.isContentEmpty = true;
		this.service = service;

		this.el.classList.add(this.classes.el);
	}

	show () {
		this.isVisible = true;
		this.el.classList.remove(this.classes.isHidden);
	}

	hide () {
		this.isVisible = false;
		this.el.classList.add(this.classes.isHidden);
	}

	setAsLoaded () {
		this.el.classList.add(this.classes.isLoaded);
	}

	setAsContentEmpty () {
		this.el.classList.add(this.classes.isContentEmpty);
	}

	/**
	 * @param  {Function} cb
	 */
	write ( cb ) {
		this.service.writeBannerContent(this, cb);
	}

	destroy () {
		[ this.classes.el, this.classes.isHidden, this.classes.isLoaded ]
			.join(' ')
			.split(' ')
			.filter(( str ) => str.trim() !== '')
			.forEach(( className ) => {
				this.el.classList.remove(className);
			});
	}

}

export default Banner;
