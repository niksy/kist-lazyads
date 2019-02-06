import $ from 'jquery';
import Lazyads from '../../index';
import ReviveAdsAdapter from '../../adapters/revive-ads';
import MediaQueryContext from '../../context/media-query';
import './index.css';

window['OA_output'] = {
	'floating': 'floating',
	'wallpaper-left': 'wallpaper-left',
	'wallpaper-right': 'wallpaper-right',
	'billboard': 'billboard',
	'mobile': 'mobile',
	'skyscraper': 'skyscraper',
	'empty-content': ''
};

const lazyads = new Lazyads({
	el: '[data-ad-id]',
	adapter: new ReviveAdsAdapter(),
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

lazyads
	.control({
		name: 'billboard',
		condition: function ( el ) {
			return el.data('ad-id') === 'billboard';
		},
		callback: function ( el, emit ) {
			if ( el.hasClass('is-loaded') ) {
				if ( el.hasClass('is-hidden') ) {
					console.log('billboard, loaded, hidden');
					emit('foo');
				}
			}
		}
	})
	.control({
		name: 'skyscraper',
		condition: function ( el ) {
			return el.data('ad-id') === 'skyscraper';
		},
		callback: function ( el, emit ) {
			if ( el.hasClass('is-loaded') ) {
				if ( el.hasClass('is-hidden') ) {
					console.log('skyscraper, loaded, hidden');
				}
			}
		}
	})
	.control({
		name: 'mobile',
		condition: function ( el ) {
			return el.data('ad-id') === 'mobile';
		},
		callback: function ( el, emit, wait ) {
			console.log('mobile');
		}
	})
	.control({
		name: 'empty-content',
		condition: function ( el ) {
			return el.data('ad-id') === 'empty-content';
		},
		callback: function ( el, emit, wait ) {
			console.log('empty-content');
		}
	})
	.init(function () {
		console.log('Lazyads initialized!');
		console.log(this);
	});

$('[data-ad-id="billboard"]').on('foo:billboard', function ( e, el ) {
	console.log(arguments);
});

$(document).on('foo:billboard', function ( e, el ) {
	console.log(e.currentTarget);
	console.log(e.target);
});
