class ContextResolver {

	constructor ( banners, contexts ) {

		this.banners = banners;
		this.contexts = contexts;

		this.contexts.forEach(( context ) => {
			context.resolve = this.resolve.bind(this);
		});

	}

	destroy () {
		this.contexts.forEach(( context ) => {
			context.destroy();
		});
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

}

export default ContextResolver;
