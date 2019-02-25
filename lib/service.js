class Service {

	afterZonesSetup () {}

	afterNewZoneRegistered () {}

	beforeZonesWrite () {}

	afterZonesWrite () {}

	writeZone () {
		return Promise.resolve(true);
	}

	isResponseEmpty () {
		return false;
	}

	destroy () {}

}

export default Service;
