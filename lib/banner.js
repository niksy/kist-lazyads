class Banner {

	/**
	 * @param  {String} name
	 * @param  {Element} el
	 * @param  {Object} classes
	 * @param  {Object} service
	 */
	constructor ( name, el, classes, service ) {
		this.name = name;
		this.el = el;
		this.classes = classes;
		this.isVisible = false;
		this.isLoaded = false;
		this.isContentEmpty = false;
		this.service = service;
	}

	show () {
		this.isVisible = true;
	}

	hide () {
		this.isVisible = false;
	}

	setAsLoaded () {
		this.isLoaded = true;
		this.isContentEmpty = false;
	}

	setAsContentEmpty () {
		this.isLoaded = true;
		this.isContentEmpty = true;
	}

	/**
	 * @param  {Function} cb
	 */
	write ( cb ) {
		this.service.writeBannerContent(this, cb);
	}

	destroy () {}

}

export default Banner;
