class Banner {

	/**
	 * @param  {String} name
	 * @param  {Element} el
	 * @param  {Object} service
	 */
	constructor ( name, el, service ) {
		this.name = name;
		this.el = el;
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
	 * @return {Promise}
	 */
	write () {
		const { el: element, name: id } = this;
		return this.service.writeZone({ element, id });
	}

	destroy () {}

}

export default Banner;
