import $ from 'jquery';
import Lazyads, { Control } from '../../index';
import ReviveAdsAdapter from '../../adapters/revive-ads';
import MediaQueryContext from '../../context/media-query';
import './index.css';

class ClassesControl extends Control {
	constructor ( elements, classes ) {
		super(elements);
		this.elements = [].slice.call(elements);
		this.classes = classes;
		this.elements.forEach(( element ) => {
			element.classList.add(this.classes.item);
			element.classList.add(this.classes.isHidden);
		});
	}
	shouldTriggerControl () {
		return Promise.resolve(true);
	}
	onShow ({ element, isContentEmpty }) {
		if ( isContentEmpty ) {
			element.classList.add(this.classes.isContentEmpty);
		} else {
			element.classList.add(this.classes.isLoaded);
		}
		element.classList.remove(this.classes.isHidden);
	}
	onHide ({ element, isContentEmpty }) {
		if ( isContentEmpty ) {
			element.classList.add(this.classes.isContentEmpty);
		} else {
			element.classList.add(this.classes.isLoaded);
		}
		element.classList.add(this.classes.isHidden);
	}
	onDestroy () {
		[
			this.classes.item,
			this.classes.isHidden,
			this.classes.isLoaded,
			this.classes.isContentEmpty
		]
			.join(' ')
			.split(' ')
			.filter(( str ) => str.trim() !== '')
			.forEach(( className ) => {
				this.elements.forEach(( element ) => {
					element.classList.remove(className);
				});
			});
	}
}

const lazyads = new Lazyads({
	zones: [
		{
			element: document.querySelector('.Banner[data-ad-id="floating"]'),
			zoneIdentifier: 'floating'
		},
		{
			element: document.querySelector('.Banner[data-ad-id="wallpaper-left"]'),
			zoneIdentifier: 'wallpaper-left'
		},
		{
			element: document.querySelector('.Banner[data-ad-id="wallpaper-right"]'),
			zoneIdentifier: 'wallpaper-right'
		},
		{
			element: document.querySelector('.Banner[data-ad-id="billboard"]'),
			zoneIdentifier: 'billboard'
		},
		{
			element: document.querySelector('.Banner[data-ad-id="mobile"]'),
			zoneIdentifier: 'mobile'
		},
		{
			element: document.querySelector('.Banner[data-ad-id="skyscraper"]'),
			zoneIdentifier: 'skyscraper'
		},
		{
			element: document.querySelector('.Banner[data-ad-id="empty-content"]'),
			zoneIdentifier: 'empty-content'
		}
	],
	service: new ReviveAdsAdapter(),
	control: [
		new ClassesControl(document.querySelectorAll('.Banner[data-ad-id]'), {
			item: 'kist-Lazyads-item',
			isHidden: 'is-hidden',
			isLoaded: 'is-loaded',
			isContentEmpty: 'is-contentEmpty'
		})
	],
	context: [
		new MediaQueryContext({
			'screen and (min-width:1000px) and (max-width:1199px)': [ 'billboard', 'skyscraper', 'floating' ],
			'screen and (min-width:1500px)': [ 'billboard', 'skyscraper', 'floating', 'wallpaper-right', 'wallpaper-left', 'empty-content' ],
			'screen and (min-width:915px) and (max-width:999px)': [ 'billboard', 'skyscraper', 'floating', 'floating' ],
			'screen and (min-width:1200px) and (max-width:1499px)': [ 'billboard', 'skyscraper', 'floating', 'wallpaper-right', 'wallpaper-left' ],
			'screen and (min-width:728px) and (max-width:914px)': [ 'billboard', 'floating' ],
			'screen and (max-width:599px)': ['mobile']
		})
	]
});

class WallpaperControl extends Control {
	shouldTriggerControl ({ element }) {
		return Promise.resolve(element.getAttribute('data-ad-id') === 'billboard');
	}
	onHide ({ element }) {
		console.log('billboard, loaded, hidden');
	}
}

class SkyscraperControl extends Control {
	shouldTriggerControl ({ element }) {
		return Promise.resolve(element.getAttribute('data-ad-id') === 'skyscraper');
	}
	onHide ({ element }) {
		console.log('skyscraper, loaded, hidden');
	}
}

class MobileControl extends Control {
	shouldTriggerControl ({ element }) {
		return Promise.resolve(element.getAttribute('data-ad-id') === 'mobile');
	}
	onShow ({ element }) {
		console.log('mobile');
	}
	onHide ({ element }) {
		console.log('mobile');
	}
}

class EmptyContentControl extends Control {
	shouldTriggerControl ({ element }) {
		return Promise.resolve(element.getAttribute('data-ad-id') === 'empty-content');
	}
	onShow ({ element }) {
		console.log('empty-content');
	}
	onHide ({ element }) {
		console.log('empty-content');
	}
}

lazyads.addControl(new WallpaperControl());
lazyads.addControl(new SkyscraperControl());
lazyads.addControl(new MobileControl());
lazyads.addControl(new EmptyContentControl());

lazyads.start(function () {
	console.log('Lazyads initialized!');
	console.log(this);
});
