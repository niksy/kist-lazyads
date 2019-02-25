import intersection from 'mout/array/intersection';
import difference from 'mout/array/difference';

class MediaQueryContext {

	/**
	 * @param  {Object} contexts
	 */
	constructor ( contexts ) {
		this.resolveAllContexts = null;
		this.contexts = this.transformContexts(contexts);
		this.listen();
	}

	/**
	 * @param  {Object} contexts
	 *
	 * @return {Object}
	 */
	transformContexts ( contexts ) {

		return Object.entries(contexts)
			.reduce(( obj, [ mq, banners ]) => {
				return {
					...obj,
					[mq]: {
						context: mq,
						mq: window.matchMedia(mq),
						banners: banners
					}
				};
			}, {});

	}

	listen () {

		Object.entries(this.contexts)
			.forEach(([ name, context ]) => {

				context._listener = ( mq ) => {
					if ( mq.matches || this.isAnyContextActive() === false ) {
						this.resolve();
					}
				};

				context.mq.addListener(context._listener);

			});

	}

	unlisten () {

		Object.entries(this.contexts)
			.forEach(([ name, context ]) => {
				context.mq.removeListener(context._listener);
			});

	};

	isAnyContextActive () {
		return Object.entries(this.contexts)
			.some(([ name, context ]) => context.mq.matches);
	}

	/**
	 * @param  {String[]} bannersList
	 */
	calculate ( bannersList ) {

		const allList = bannersList;
		const allVisibleBanners = this.getVisibleBanners();
		const allHiddenBanners = difference(allList, allVisibleBanners);

		const list = bannersList;
		const visibleBanners = intersection(allVisibleBanners, list);
		const hiddenBanners = difference(list, visibleBanners);

		return {
			hide: hiddenBanners,
			show: visibleBanners
		};

	}

	/**
	 * @return {String[]}
	 */
	getVisibleBanners () {

		return Object.entries(this.contexts)
			.reduce(( arr, [ name, context ]) => {
				if ( context.mq.matches ) {
					return [...arr, ...context.banners];
				}
				return arr;
			}, []);

	}

	destroy () {
		this.unlisten();
		this.contexts = {};
	}

	resolve () {
		if ( typeof this.resolveAllContexts !== 'function' ) {
			return;
		}
		this.resolveAllContexts();
	}

}

export default MediaQueryContext;
