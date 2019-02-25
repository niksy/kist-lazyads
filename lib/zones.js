import Zone from './zone';

/**
 * [filterById description]
 *
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

		this.zones = [];
		this.controlResolver = controlResolver;
		this.service = service;

		zones.forEach(( zone ) => {
			this.add([zone]);
		});

		const serviceProps = this.zones.map(({ element, id }) => ({
			element,
			id
		}));
		this.service.afterZonesSetup(serviceProps);

	}

	/**
	 * @param  {Object[]} zones
	 */
	add ( zones = [] ) {

		// Get existing zone IDs
		const existingZoneIds = this.zones.map(({ id }) => id);

		// Filter only new zones (not already added to collection)
		const newZones = zones.filter(({ id }) => existingZoneIds.indexOf(id) === -1);

		// Create zone instances based on new zone elements
		const zoneInstances = newZones.map(({ element, id }) => new Zone(id, element, this.service));

		this.zones = [ ...this.zones, ...zoneInstances ];

	}

	/**
	 * @param  {String[]} zoneIds
	 */
	show ( zoneIds ) {

		const boundFilterById = filterById(zoneIds);
		const zones = this.zones.filter(boundFilterById);

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
		const zones = this.zones.filter(boundFilterById);

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
		const zones = this.zones
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
		this.zones.forEach(( zone ) => {
			zone.destroy();
		});
		this.controlResolver.destroy(this.zones);
	}

}

export default Zones;
