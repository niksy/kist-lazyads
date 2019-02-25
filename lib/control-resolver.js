class ControlResolver {

	constructor () {
		this.controls = [];
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

		const { el: element, name: zoneIdentifier, isLoaded, isContentEmpty } = banner;

		if ( !shouldShow ) {
			banner.hide();
		} else {
			banner.show();
		}

		this.controls.forEach(( control ) => {

			let triggerPromise = control.triggerResults[zoneIdentifier];
			if ( typeof triggerPromise === 'undefined' ) {
				triggerPromise = control.triggerResults[zoneIdentifier] = control.shouldTriggerControl({ element, zoneIdentifier });
			}

			triggerPromise
				.then(( isControlTriggered ) => {
					if ( isLoaded && isControlTriggered ) {
						let loadPromise = control.loadResults[zoneIdentifier];
						if ( typeof loadPromise === 'undefined' ) {
							loadPromise = control.loadResults[zoneIdentifier] = control.onLoad({ element, zoneIdentifier });
						}
						return loadPromise;
					}
					return Promise.reject({ reason: 'untriggeredControl' });
				})
				.then(( loadResult ) => {
					if ( shouldShow ) {
						const { isVisible } = banner;
						if ( isVisible ) {
							control.onShow({ element, zoneIdentifier, isContentEmpty, loadResult });
						}
					} else {
						control.onHide({ element, zoneIdentifier, isContentEmpty, loadResult });
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

			banners.forEach(({ el: element, name: zoneIdentifier, isContentEmpty }) => {
				const loadResult = loadResults[zoneIdentifier] || Promise.resolve();
				control.onDestroy({ element, zoneIdentifier, isContentEmpty, loadResult });
			});

		});

		this.controls = [];

	}

}

export default ControlResolver;
