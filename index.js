import Zones from './lib/zones';
import ControlResolver from './lib/control-resolver';
import ContextResolver from './lib/context-resolver';
import Control from './lib/control';
import Context from './lib/context';
import Service from './lib/service';

class Advertol {

	/**
	 * @param  {Object} options
	 */
	constructor ( options = {} ) {

		const {
			zones = [],
			service = null,
			control = [],
			context = []
		} = options;

		this.service = service;
		this.controlResolver = new ControlResolver(control);
		this.zones = new Zones(zones, this.controlResolver, this.service);
		this.contextResolver = new ContextResolver(this.zones, context);

	}

	run () {
		this.contextResolver.resolve();
	}

	/**
	 * @param  {Control} control
	 */
	addControl ( control ) {
		this.controlResolver.addControl(control);
	}

	/**
	 * @param  {Context} context
	 */
	addContext ( context ) {
		this.contextResolver.addContext(context);
	}

	/**
	 * @param {Object} zone
	 * @param {Element} zone.element
	 * @param {String} zone.id
	 */
	addZone ({ element, id }) {
		this.zones.add({ element, id });
		this.service.afterNewZoneRegistered({ element, id });
	}

	update () {
		this.contextResolver.resolve();
	}

	destroy () {
		this.service.destroy();
		this.controlResolver.destroy();
		this.zones.destroy();
		this.contextResolver.destroy();
	}

}

export default Advertol;

export {
	Control,
	Context,
	Service
};
