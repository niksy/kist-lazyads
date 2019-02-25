import postscribe from 'postscribe';
import meta from '../lib/meta';

class ReviveAdsAdapter {

	constructor () {
		this.content = window.OA_output;
	}

	afterZonesSetup ( banners ) {}
	beforeZonesWrite ( banners ) {}
	afterZonesWrite ( banners ) {}

	/**
	 * @param  {Banner}   banner
	 */
	writeZone ({ element, id }) {

		return new Promise(( resolve, reject ) => {

			var content = this.content[id];

			/*
			 * If ad content is empty (or doesn’t exist, e.g. ad blocker is active),
			 * we don't want to display it
			 */
			if ( this.isResponseEmpty(content) ) {
				element.innerHTML = content;
				resolve(false);
				return;
			}

			element.innerHTML = '';
			postscribe(element, content, {
				done: () => {
					resolve(true);
				}
			});

		});

	}

	/**
	 * Banner response is considered empty if it returns (trimmed) empty string for its content.
	 * It should return `true` if content is empty.
	 *
	 * @param  {Mixed} content
	 *
	 * @return {Boolean}
	 */
	isResponseEmpty ( content ) {
		if ( typeof content === 'string' ) {
			return content.trim() === '' || /bannerid=0&amp;campaignid=0/.test(content);
		}
		return false;
	}

}

export default ReviveAdsAdapter;
