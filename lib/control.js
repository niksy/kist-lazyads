class Control {

	constructor () {
		this.triggerResults = {};
		this.loadResults = {};
	}

	shouldTriggerControl ({ element }) {
		return Promise.resolve(false);
	}

	onLoad ({ element, isContentEmpty }) {
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
