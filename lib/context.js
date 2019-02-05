import intersection from 'mout/array/intersection';
import difference from 'mout/array/difference';

/**
 * @param  {Object}  contexts
 *
 * @return {Boolean}
 */
function isAnyContextActive ( contexts ) {

	return Object.entries(contexts)
		.some(([ name, context ]) => context.mq.matches);

}

/**
 * @param  {Banners} banners
 * @param  {Object} contexts
 */
function Context ( banners, contexts ) {

	this.banners = banners;
	this.contexts = this.transformContexts(contexts);

}

Context.prototype.init = function () {
	this.listen();
	this.calculate(this.banners.list);
};

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
				if ( mq.matches ) {
					this.calculate(this.banners.list);
				}
				if ( !isAnyContextActive(this.contexts) ) {
					this.banners.hide(this.banners.list);
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

/**
 * @param  {String[]} rawList
 */
Context.prototype.calculate = function ( rawList ) {

	const allList = this.banners.list;
	const allVisibleBanners = this.getVisibleBanners();
	const allHiddenBanners = difference(allList, allVisibleBanners);

	const list = rawList;
	const visibleBanners = intersection(allVisibleBanners, list);
	const hiddenBanners = difference(list, visibleBanners);

	this.banners.hide(hiddenBanners);
	this.banners.show(visibleBanners);
	this.banners.write(visibleBanners);

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

export default Context;
