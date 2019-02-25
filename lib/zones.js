import Zone from './zone';

/**
 * @param  {String[]} zoneIds
 *
 * @return {Function}
 */
function filterById ( zoneIds ) {

	/**
	 * @param  {Zone} zone
	 *
	 * @return {Boolean}
	 */
	return function ({ id }) {
		return zoneIds.indexOf(id) !== -1;
	};
}

class Zones {

	/**
	 * @param  {Object[]} zones
	 * @param  {ControlResolver} controlResolver
	 * @param  {Service} service
	 */
	constructor ( zones, controlResolver, service ) {

		this.instances = [];
		this.controlResolver = controlResolver;
		this.service = service;

		zones.forEach(( zone ) => {
			this.add(zone);
		});

		const serviceProps = this.instances.map(({ element, id }) => ({
			element,
			id
		}));
		this.service.afterZonesSetup(serviceProps);

	}

	/**
	 * @param {Object} zone
	 * @param {Element} zone.element
	 * @param {String} zone.id
	 */
	add ({ element, id }) {

		// Get existing zone IDs
		const existingZoneIds = this.instances.map(({ id: existingZoneId }) => existingZoneId);

		// Check if requested zone ID already exists in collection
		if ( existingZoneIds.some(( existingZoneId ) => existingZoneId === id) ) {
			return;
		}

		// Create zone instance based on new zone element
		this.instances.push(new Zone(id, element, this.service));

	}

	/**
	 * @param  {String[]} zoneIds
	 */
	show ( zoneIds ) {

		const boundFilterById = filterById(zoneIds);
		const zones = this.instances.filter(boundFilterById);

		zones.forEach(( zone ) => {
			this.controlResolver.resolve({
				zone: zone,
				shouldShow: !zone.isContentEmpty
			});
		});

	}

	/**
	 * @param  {String[]} zoneIds
	 */
	hide ( zoneIds ) {

		const boundFilterById = filterById(zoneIds);
		const zones = this.instances.filter(boundFilterById);

		zones.forEach(( zone ) => {
			this.controlResolver.resolve({
				zone: zone,
				shouldShow: false
			});
		});

	}

	/**
	 * @param  {String[]} zoneIds
	 */
	write ( zoneIds ) {

		const boundFilterById = filterById(zoneIds);
		const zones = this.instances
			.filter(boundFilterById)
			.filter(({ isLoaded }) => isLoaded === false);

		const serviceProps = zones.map(({ element, id }) => ({
			element,
			id
		}));

		this.service.beforeZonesWrite(serviceProps);

		zones.forEach(( zone ) => {

			zone.write()
				.then(( hasContent ) => {

					const isContentEmpty = !hasContent;

					if ( isContentEmpty ) {
						zone.setAsContentEmpty();
					} else {
						zone.setAsLoaded();
					}

					this.controlResolver.resolve({
						zone: zone,
						shouldShow: !isContentEmpty
					});

					return;

				});

		});

		this.service.afterZonesWrite(serviceProps);

	}

	destroy () {
		this.instances.forEach(( zone ) => {
			zone.destroy();
		});
		this.controlResolver.destroy(this.instances);
	}

}

export default Zones;
