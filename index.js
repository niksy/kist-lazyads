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

		this.contextResolver = new ContextResolver(this.banners, this.options.context);

	}

	/**
	 * @param  {Function} cb
	 *
	 * @return {Lazyads}
	 */
	start ( cb = () => {} ) {
		this.active = true;
		this.contextResolver.resolve();
		cb.call(this.options);
	}

	/**
	 * @param  {Object} props
	 *
	 * @return {Lazyads}
	 */
	addControl ( props ) {
		this.banners.control.add(props);
	}

	/**
	 * @return {Lazyads}
	 */
	update () {
		this.banners.forEach(( banner ) => {
			this.banners.control.resolve(banner);
		});
	}

	/**
	 * @param {Object} placeholder
	 * @param {Element} placeholder.element
	 * @param {String} placeholder.zoneIdentifier
	 *
	 * @return {Lazyads}
	 */
	addPlaceholder ({ element, zoneIdentifier }) {
		this.banners.add(this.banners.createBanners(element, zoneIdentifier));
		this.contextResolver.resolve();
	}

	/**
	 * @return {Lazyads}
	 */
	 destroy () {
		this.banners.destroy();
		this.contextResolver.destroy();
		this.banners = null;
		this.contextResolver = null;
		this.active = false;
	}

}

export default Lazyads;

export { Control };
