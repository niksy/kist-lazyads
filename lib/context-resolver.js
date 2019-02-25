class ContextResolver {

	/**
	 * @param  {Zones} zones
	 * @param  {Context[]}  contexts
	 */
	constructor ( zones, contexts = [] ) {

		this.zones = zones;
		this.contexts = [];

		contexts.forEach(( context ) => {
			this.addContext(context);
		});

	}

	/**
	 * @param {Context} context
	 */
	addContext ( context ) {
		context.resolveAllContexts = this.resolve.bind(this);
		this.contexts.push(context);
	}

	resolve () {

		const zoneIds = this.zones.instances.map(({ id }) => id);

		const {
			hide,
			show
		} = this.contexts
			.reduce(( { hide: previousHide, show: previousShow }, context ) => {
				const {
					show: nextShow,
					hide: nextHide
				} = context.calculate(previousShow);
				return {
					show: nextShow,
					hide: [...previousHide, ...nextHide]
				};
			}, {
				hide: [],
				show: zoneIds
			});

		this.zones.hide(hide);
		this.zones.show(show);
		this.zones.write(show);

	}

	destroy () {

		this.contexts.forEach(( context ) => {
			context.destroy();
		});

	}

}

export default ContextResolver;
