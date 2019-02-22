import postscribe from 'postscribe';
import meta from '../lib/meta';

/**
 * @param  {Function} cb
 */
function success ( cb ) {
	this.setAsLoaded();
	this.isLoaded = true;
	this.isContentEmpty = false;
	cb.call(null, this.el);
}

/**
 * @param  {Function} cb
 */
function successEmpty ( cb ) {
	this.setAsContentEmpty();
	this.isLoaded = true;
	this.isContentEmpty = true;
	cb.call(null, this.el);
}

class ReviveAdsAdapter {

	constructor () {
		this.content = window.OA_output;
	}

	onBannersInit ( banners ) {}
	beforeBannersWrite ( banners ) {}
	afterBannersWrite ( banners ) {}

	/**
	 * @param  {Banner}   banner
	 * @param  {Function} cb
	 */
	writeBannerContent ( banner, cb ) {

		var bannerCtx = banner;
		var content = this.content[bannerCtx.name];
		cb = cb || (() => {});

		/*
		 * If ad content is empty (or doesn’t exist, e.g. ad blocker is active),
		 * we don't want to display it
		 */
		if ( this.isResponseEmpty(content) ) {
			bannerCtx.el.innerHTML = content;
			successEmpty.call(bannerCtx, cb);
			return;
		}

		bannerCtx.el.innerHTML = '';
		postscribe(bannerCtx.el, content, {
			done: success.bind(bannerCtx, cb)
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
