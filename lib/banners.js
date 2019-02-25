import Banner from './banner';
import ControlResolver from './control-resolver';

class Banners {

	/**
	 * @param  {Object[]} zones
	 * @param  {Object} options
	 */
	constructor ( zones, options ) {

		this.options = options;
		this.control = new ControlResolver();

		this.add(this.createBanners(zones));

		const serviceProps = this.banners.map(({ el: element, name: zoneIdentifier }) => ({
			element,
			zoneIdentifier
		}));
		this.options.service.afterZonesSetup(serviceProps);

	}

	/**
	 * @param  {Object[]} zones
	 *
	 * @return {Banner[]}
	 */
	createBanners ( zones ) {

		// Get existing banner names
		const existingBannerNames = (this.banners || []).map(({ name }) => name);

		// Filter only new banners (not already added to collection)
		const newZones = zones.filter(({ zoneIdentifier }) => {
			return existingBannerNames.indexOf(zoneIdentifier) === -1;
		});

		// Create Banner instances based on new banner elements
		const banners = newZones.map(({ element, zoneIdentifier }) => {
			return new Banner(zoneIdentifier, element, this.options.classes, this.options.service);
		});

		return banners;

	}

	/**
	 * @param  {Banner[]} banners
	 *
	 * @return {Banner[]}
	 */
	add ( banners = [] ) {

		this.banners = [ ...(this.banners || []), ...banners ];
		this.list = this.banners.map(({ name }) => name);

		return banners;

	}

	/**
	 * @param  {String[]} arr
	 * @param  {Function} cb
	 *
	 * @return {Banner[]}
	 */
	get ( arr, cb = () => true ) {

		const banners = this.banners.filter(( banner ) => {
			return arr.indexOf(banner.name) !== -1;
		});

		return banners.filter(cb);

	}

	/**
	 * @param  {String[]} arr
	 */
	show ( arr ) {

		const banners = this.get(arr);

		banners.forEach(( banner ) => {
			this.control.resolve({
				banner: banner,
				shouldShow: !banner.isContentEmpty
			});
		});

	}

	/**
	 * @param  {String[]} arr
	 */
	hide ( arr ) {

		const banners = this.get(arr);

		banners.forEach(( banner ) => {
			this.control.resolve({
				banner: banner,
				shouldShow: false
			});
		});

	}

	/**
	 * @param  {String[]} arr
	 */
	write ( arr ) {

		const banners = this.get(arr, ( banner ) => !banner.isLoaded);

		const serviceProps = banners.map(({ el: element, name: zoneIdentifier }) => ({
			element,
			zoneIdentifier
		}));

		this.options.service.beforeZonesWrite(serviceProps);

		banners.forEach(( banner ) => {

			banner.write()
				.then(( hasContent ) => {

					const isContentEmpty = !hasContent;

					if ( isContentEmpty ) {
						banner.setAsContentEmpty();
					} else {
						banner.setAsLoaded();
					}

					this.control.resolve({
						banner: banner,
						shouldShow: !isContentEmpty
					});

					return;

				});

		});

		this.options.service.afterZonesWrite(serviceProps);

	}

	destroy () {
		this.banners.forEach(( banner ) => {
			banner.destroy();
		});
		this.control.destroy(this.banners);
	}

}

export default Banners;
