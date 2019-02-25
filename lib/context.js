class Context {

	constructor () {
		this.resolveAllContexts = null;
	}

	calculate () {}

	resolve () {
		if ( typeof this.resolveAllContexts !== 'function' ) {
			return;
		}
		this.resolveAllContexts();
	}

	destroy () {}

}

export default Context;
