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

			control.shouldTriggerControl({ element })
				.then(( isControlTriggered ) => {
					if ( !isLoaded && !isControlTriggered ) {
						return Promise.reject();
					}
					let promise = control.resolvedZones[zoneIdentifier];
					if ( typeof promise === 'undefined' ) {
						promise = control.resolvedZones[zoneIdentifier] = control.onLoad({ element, isContentEmpty });
					}
					return promise;
				})
				.then(( loadResult ) => {
					if ( shouldShow ) {
						control.onShow({ element, isContentEmpty, loadResult });
					} else {
						control.onHide({ element, isContentEmpty, loadResult });
					}
					return;
				})
				.catch(() => {});

		});

	}

	/**
	 * @param  {Banner[]} banners
	 */
	destroy ( banners ) {

		this.controls.forEach(( control ) => {

			const loadResults = control.resolvedZones;

			banners.forEach(({ el: element, name: zoneIdentifier, isContentEmpty }) => {
				const loadResult = loadResults[zoneIdentifier] || Promise.resolve();
				control.onDestroy({ element, isContentEmpty, loadResult });
			});

		});

		this.controls = [];

	}

}

export default ControlResolver;
