import intersection from 'mout/array/intersection';
import difference from 'mout/array/difference';

/**
 * @param  {Object} contexts
 */
function Context ( contexts ) {
	this.contexts = this.transformContexts(contexts);
	this.listen();
}

/**
 * @param  {Object} contexts
 *
 * @return {Object}
 */
Context.prototype.transformContexts = function ( contexts ) {

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

};

Context.prototype.listen = function () {

	Object.entries(this.contexts)
		.forEach(([ name, context ]) => {

			context._listener = ( mq ) => {
				if ( mq.matches || this.isAnyContextActive() === false ) {
					this.resolve();
				}
			};

			context.mq.addListener(context._listener);

		});

};

Context.prototype.unlisten = function () {

	Object.entries(this.contexts)
		.forEach(([ name, context ]) => {
			context.mq.removeListener(context._listener);
		});

};

Context.prototype.isAnyContextActive = function () {
	return Object.entries(this.contexts)
		.some(([ name, context ]) => context.mq.matches);
};

/**
 * @param  {String[]} bannersList
 */
Context.prototype.calculate = function ( bannersList ) {

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

};

/**
 * @return {String[]}
 */
Context.prototype.getVisibleBanners = function () {

	return Object.entries(this.contexts)
		.reduce(( arr, [ name, context ]) => {
			if ( context.mq.matches ) {
				return [...arr, ...context.banners];
			}
			return arr;
		}, []);

};

Context.prototype.destroy = function () {
	this.unlisten();
	this.contexts = {};
};

Context.prototype.resolve = function () {};

export default Context;
