import isPromise from 'is-promise';

class Control {

	/**
	 * @class
	 *
	 * @return {Control}
	 */
	constructor () {
		this.controls = [];
	}

	/**
	 * @param {Object} control
	 */
	add ( control ) {

		this.controls.push({
			name: '',
			condition: () => true,
			callback: () => {},
			...control
		});

	}

	/**
	 * @param  {Object} options
	 * @param  {Banner} options.banner
	 * @param  {Boolean} options.shouldShow
	 */
	resolve ({ banner, shouldShow }) {

		const { el: element } = banner;

		if ( !shouldShow ) {
			banner.hide();
		} else {
			banner.show();
		}

		this.controls.forEach(( control ) => {
			const condition = control.condition.call(null, element);
			if ( isPromise(condition) ) {
				condition.then(( bool ) => {
					if ( bool ) {
						control.callback.call(null, element);
					}
					return bool;
				});
			} else if ( condition ) {
				control.callback.call(null, element);
			}
		});

	}

	destroy () {
		this.controls = [];
	}

}

export default Control;
