class Control {

	constructor () {
		this.triggerResults = {};
		this.loadResults = {};
	}

	shouldTriggerControl ({ element }) {
		return Promise.resolve(false);
	}

	afterZoneLoad ({ element, id, isContentEmpty }) {
		return Promise.resolve();
	}

	onZoneShow ({ element, id, isContentEmpty, loadResult }) {

	}

	onZoneHide ({ element, id, isContentEmpty, loadResult }) {

	}

	destroy ({ element, id, isContentEmpty, loadResult }) {

	}

}

export default Control;
