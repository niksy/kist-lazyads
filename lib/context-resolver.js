class ContextResolver {

	constructor ( banners, contexts = [] ) {

		this.banners = banners;
		this.contexts = [];

		contexts.forEach(( context ) => {
			this.add(context);
		});

	}

	/**
	 * @param {Context} context
	 */
	add ( context ) {
		context.resolveAllContexts = this.resolve.bind(this);
		this.contexts.push(context);
	}

	resolve () {

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
				show: this.banners.list
			});

		this.banners.hide(hide);
		this.banners.show(show);
		this.banners.write(show);

	}

	destroy () {

		this.contexts.forEach(( context ) => {
			context.destroy();
		});

	}

}

export default ContextResolver;
