import $ from 'jquery';
import Lazyads from '../../index';
import ReviveAdsAdapter from '../../adapters/revive-ads';
import MediaQueryContext from '../../context/media-query';
import './index.css';

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

lazyads.addControl({
	name: 'billboard',
	condition: function ( el ) {
		return el.getAttribute('data-ad-id') === 'billboard';
	},
	callback: function ( el ) {
		el = $(el);
		if ( el.hasClass('is-loaded') ) {
			if ( el.hasClass('is-hidden') ) {
				console.log('billboard, loaded, hidden');
			}
		}
	}
});

lazyads.addControl({
	name: 'skyscraper',
	condition: function ( el ) {
		return el.getAttribute('data-ad-id') === 'skyscraper';
	},
	callback: function ( el ) {
		el = $(el);
		if ( el.hasClass('is-loaded') ) {
			if ( el.hasClass('is-hidden') ) {
				console.log('skyscraper, loaded, hidden');
			}
		}
	}
});

lazyads.addControl({
	name: 'mobile',
	condition: function ( el ) {
		return el.getAttribute('data-ad-id') === 'mobile';
	},
	callback: function ( el ) {
		console.log('mobile');
	}
});

lazyads.addControl({
	name: 'empty-content',
	condition: function ( el ) {
		return el.getAttribute('data-ad-id') === 'empty-content';
	},
	callback: function ( el ) {
		console.log('empty-content');
	}
});

lazyads.start(function () {
	console.log('Lazyads initialized!');
	console.log(this);
});
