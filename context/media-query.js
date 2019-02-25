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
			.reduce(( obj, [ mq, zones ]) => {
				return {
					...obj,
					[mq]: {
						context: mq,
						mq: window.matchMedia(mq),
						zones: zones
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
	 * @param  {String[]} zonesList
	 */
	calculate ( zonesList ) {

		const allList = zonesList;
		const allVisibleZones = this.getVisibleZones();
		const allHiddenZones = difference(allList, allVisibleZones);

		const list = zonesList;
		const visibleZones = intersection(allVisibleZones, list);
		const hiddenZones = difference(list, visibleZones);

		return {
			hide: hiddenZones,
			show: visibleZones
		};

	}

	/**
	 * @return {String[]}
	 */
	getVisibleZones () {

		return Object.entries(this.contexts)
			.reduce(( arr, [ name, context ]) => {
				if ( context.mq.matches ) {
					return [...arr, ...context.zones];
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
