class Control {

	constructor () {
		this.resolvedZones = {};
	}

	shouldTriggerControl ({ element }) {
		return Promise.resolve(false);
	}

	onLoad ({ element }) {
		return Promise.resolve();
	}

	onShow ({ element, isContentEmpty, loadResult }) {

	}

	onHide ({ element, isContentEmpty, loadResult }) {

	}

	onDestroy ({ element, isContentEmpty, loadResult }) {

	}

}

export default Control;
