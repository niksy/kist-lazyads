import inViewport from 'element-within-viewport';

class ViewportContext {

	constructor ( filter = [] ) {
		this.filter = filter;
		this.visible = [];
		this.listen();
	}

	listen () {

		this.listener = this.filter.map(( item ) => {
			this.listener = inViewport(document.querySelector(`[data-ad-id="${item}"]`), {
				once: true,
				debounce: 0,
				onEnter: () => {
					this.visible.push(item);
					this.resolve();
				}
			});
		});

	}

	unlisten () {
		this.listener.forEach(( listener ) => {
			listener.destroy();
		});
	}

	calculate ( list ) {
		const ommited = list.filter(( name ) => !this.filter.includes(name));
		return {
			hide: this.filter.filter(( name ) => !this.visible.includes(name)),
			show: [...ommited, ...this.visible]
		};
	}

	destroy () {}

	resolve () {}

}

export default ViewportContext;
