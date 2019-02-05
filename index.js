import $ from 'jquery';
import meta from './lib/meta';
import Banners from './lib/banners';
import ContextResolver from './lib/context-resolver';

class Lazyads {

	constructor ( options = {} ) {

		const {
			el = '[data-ad-id]',
			contentIdDataProp = 'ad-id',
			context = [],
			adapter = null,
			classes = {}
		} = options;

		this.options = {
			el,
			contentIdDataProp,
			context,
			adapter,
			classes: {
				el: `${meta.ns.htmlClass}-item`,
				isLoaded: 'is-loaded',
				isHidden: 'is-hidden',
				isContentEmpty: 'is-contentEmpty',
				...classes
			}
		};

		this.banners = new Banners(this.options.el, this.options);

		this.contextResolver = new ContextResolver(this.banners, this.options.context);

	}

	/**
	 * @param  {Function} cb
	 *
	 * @return {Lazyads}
	 */
	init ( cb = () => {} ) {
		this.active = true;
		this.contextResolver.resolve();
		cb.call(this.options);
		return this;
	}

	/**
	 * @param  {Object} props
	 *
	 * @return {Lazyads}
	 */
	control ( props ) {
		this.banners.control.add(props);
		return this;
	}

	/**
	 * @return {Lazyads}
	 */
	recheckControl () {
		this.banners.forEach(( banner ) => {
			this.banners.control.resolve(banner);
		});
		return this;
	}

	/**
	 * @param {jQuery|Element} el
	 *
	 * @return {Lazyads}
	 */
	addPlaceholder ( el ) {
		this.banners.add(this.banners.createBanners($(el)));
		this.contextResolver.resolve();
		return this;
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
		return this;
	}

}

export default Lazyads;
