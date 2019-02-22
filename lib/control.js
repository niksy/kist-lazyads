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
	 * @param  {Banner} banner
	 */
	resolve ( banner ) {

		const { el: element } = banner;

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
