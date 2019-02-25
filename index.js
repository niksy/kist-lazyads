import Banners from './lib/banners';
import ControlResolver from './lib/control-resolver';
import ContextResolver from './lib/context-resolver';
import Control from './lib/control';

class Lazyads {

	constructor ( options = {} ) {

		const {
			zones = [],
			service = null,
			control = [],
			context = []
		} = options;

		this.service = service;
		this.controlResolver = new ControlResolver(control);
		this.banners = new Banners(zones, this.controlResolver, this.service);
		this.contextResolver = new ContextResolver(this.banners, context);

	}

	run () {
		this.contextResolver.resolve();
	}

	/**
	 * @param  {Control} control
	 */
	addControl ( control ) {
		this.controlResolver.add(control);
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
	 * @param {String} zone.id
	 */
	addZone ({ element, id }) {
		this.banners.add(this.banners.createBanners(element, id));
		this.options.service.afterNewZoneRegistered({ element, id });
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
