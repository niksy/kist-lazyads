class ControlResolver {

	constructor ( controls = [] ) {

		this.controls = [];

		controls.forEach(( control ) => {
			this.add(control);
		});

	}

	/**
	 * @param {Control} control
	 */
	add ( control ) {
		this.controls.push(control);
	}

	/**
	 * @param  {Object} options
	 * @param  {Banner} options.banner
	 * @param  {Boolean} options.shouldShow
	 */
	resolve ({ banner, shouldShow }) {

		const { el: element, name: id, isLoaded, isContentEmpty } = banner;

		if ( !shouldShow ) {
			banner.hide();
		} else {
			banner.show();
		}

		this.controls.forEach(( control ) => {

			let triggerPromise = control.triggerResults[id];
			if ( typeof triggerPromise === 'undefined' ) {
				triggerPromise = control.triggerResults[id] = control.shouldTriggerControl({ element, id });
			}

			triggerPromise
				.then(( isControlTriggered ) => {
					if ( isLoaded && isControlTriggered ) {
						let loadPromise = control.loadResults[id];
						if ( typeof loadPromise === 'undefined' ) {
							loadPromise = control.loadResults[id] = control.onLoad({ element, id });
						}
						return loadPromise;
					}
					return Promise.reject({ reason: 'untriggeredControl' });
				})
				.then(( loadResult ) => {
					if ( shouldShow ) {
						const { isVisible } = banner;
						if ( isVisible ) {
							control.onShow({ element, id, isContentEmpty, loadResult });
						}
					} else {
						control.onHide({ element, id, isContentEmpty, loadResult });
					}
					return control;
				})
				.catch(( error ) => {
					if ( typeof error === 'object' && error.reason === 'untriggeredControl' ) {
						return control;
					}
					throw error;
				});

		});

	}

	/**
	 * @param  {Banner[]} banners
	 */
	destroy ( banners ) {

		this.controls.forEach(( control ) => {

			const loadResults = control.loadResults;

			banners.forEach(({ el: element, name: id, isContentEmpty }) => {
				const loadResult = loadResults[id] || Promise.resolve();
				control.onDestroy({ element, id, isContentEmpty, loadResult });
			});

		});

		this.controls = [];

	}

}

export default ControlResolver;
