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
	 * @param  {Zone} options.zone
	 * @param  {Boolean} options.shouldShow
	 */
	resolve ({ zone, shouldShow }) {

		const { element, id, isLoaded, isContentEmpty } = zone;

		if ( !shouldShow ) {
			zone.hide();
		} else {
			zone.show();
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
						const { isVisible } = zone;
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
	 * @param  {Zone[]} zones
	 */
	destroy ( zones ) {

		this.controls.forEach(( control ) => {

			const loadResults = control.loadResults;

			zones.forEach(({ element, id, isContentEmpty }) => {
				const loadResult = loadResults[id] || Promise.resolve();
				control.onDestroy({ element, id, isContentEmpty, loadResult });
			});

		});

		this.controls = [];

	}

}

export default ControlResolver;
