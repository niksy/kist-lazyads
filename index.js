import meta from './lib/meta';
import Banners from './lib/banners';
import ContextResolver from './lib/context-resolver';
import Control from './lib/control';

class Lazyads {

	constructor ( options = {} ) {

		const {
			zones = [],
			service = null,
			control = [],
			context = [],
			classes = {}
		} = options;

		this.options = {
			zones,
			service,
			control,
			context,
			classes: {
				el: `${meta.ns.htmlClass}-item`,
				isLoaded: 'is-loaded',
				isHidden: 'is-hidden',
				isContentEmpty: 'is-contentEmpty',
				...classes
			}
		};

		this.banners = new Banners(this.options.zones, this.options);

		control.forEach(( entry ) => {
			this.banners.control.add(entry);
		});

		this.contextResolver = new ContextResolver(this.banners, this.options.context);

	}

	run () {
		this.contextResolver.resolve();
	}

	/**
	 * @param  {Control} control
	 */
	addControl ( control ) {
		this.banners.control.add(control);
	}

	/**
	 * @param  {Context} context
	 */
	addContext ( context ) {
		this.contextResolver.add(context);
	}

	/**
	 * @param {Object} zone
	 * @param {Element} zone.element
	 * @param {String} zone.zoneIdentifier
	 */
	addZone ({ element, zoneIdentifier }) {
		this.banners.add(this.banners.createBanners(element, zoneIdentifier));
		this.options.service.afterNewZoneRegistered({ element, zoneIdentifier });
	}

	update () {
		this.contextResolver.resolve();
	}

	destroy () {
		this.banners.destroy();
		this.contextResolver.destroy();
		this.banners = null;
		this.contextResolver = null;
	}

}

export default Lazyads;

export { Control };
