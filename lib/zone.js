class Zone {

	/**
	 * @param  {String} id
	 * @param  {Element} element
	 * @param  {Object} service
	 */
	constructor ( id, element, service ) {
		this.id = id;
		this.element = element;
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
		const { element, id } = this;
		return this.service.writeZone({ element, id });
	}

	destroy () {}

}

export default Zone;
