import isPromise from 'is-promise';

/**
 * @param  {jQuery} el
 * @param  {String} controlName
 *
 * @return {Function}
 */
function emit ( el, controlName ) {

	/**
	 * @param  {String} eventName
	 */
	return function ( eventName ) {
		el.trigger(`${eventName}:${controlName}`, [el]);
	};
}

/**
 * @param  {Object} ctx
 *
 * @return {Function}
 */
function waitForLayout ( ctx ) {

	/**
	 * Some banners report incorrect size so we have to take render time difference.
	 *
	 * @param  {Function} cb
	 * @param  {Number} pTimeout
	 */
	return function ( cb, timeout ) {
		setTimeout(cb.bind(ctx), timeout || 300);
	};
}

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

		const $banner = banner.$el;

		this.controls.forEach(( control ) => {
			const condition = control.condition.call($banner[0], $banner);
			if ( isPromise(condition) ) {
				condition.then(( bool ) => {
					if ( bool ) {
						control.callback.call($banner[0], $banner, emit($banner, control.name), waitForLayout(this));
					}
					return bool;
				});
			} else if ( condition ) {
				control.callback.call($banner[0], $banner, emit($banner, control.name), waitForLayout(this));
			}
		});

	}

	destroy () {
		this.controls = [];
	}

}

export default Control;
