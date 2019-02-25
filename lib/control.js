class Control {

	constructor () {
		this.triggerResults = {};
		this.loadResults = {};
	}

	shouldTriggerControl ({ element }) {
		return Promise.resolve(false);
	}

	onLoad ({ element, id, isContentEmpty }) {
		return Promise.resolve();
	}

	onShow ({ element, id, isContentEmpty, loadResult }) {

	}

	onHide ({ element, id, isContentEmpty, loadResult }) {

	}

	onDestroy ({ element, id, isContentEmpty, loadResult }) {

	}

}

export default Control;
