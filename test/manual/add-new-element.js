import $ from 'jquery';
import Lazyads from '../../index';
import ReviveAdsAdapter from '../../adapters/revive-ads';
import './index.css';

window['OA_output'] = {
	'floating': 'floating',
	'wallpaper-left': 'wallpaper-left',
	'wallpaper-right': 'wallpaper-right',
	'billboard': 'billboard',
	'mobile': 'mobile',
	'skyscraper': 'skyscraper',
	'new-ad': 'new ad',
	'empty-content': '',
	'new-ad-empty-content': ''
};

const lazyads = new Lazyads({
	el: '[data-ad-id]',
	adapter: new ReviveAdsAdapter(),
	context: {
		'screen and (min-width:1000px) and (max-width:1199px)': [ 'billboard', 'skyscraper', 'floating', 'new-ad', 'new-ad-empty-content' ],
		'screen and (min-width:1500px)': [ 'billboard', 'skyscraper', 'floating', 'wallpaper-right', 'wallpaper-left', 'empty-content', 'new-ad', 'new-ad-empty-content' ],
		'screen and (min-width:915px) and (max-width:999px)': [ 'billboard', 'skyscraper', 'floating', 'floating' ],
		'screen and (min-width:1200px) and (max-width:1499px)': [ 'billboard', 'skyscraper', 'floating', 'wallpaper-right', 'wallpaper-left', 'new-ad', 'new-ad-empty-content' ],
		'screen and (min-width:728px) and (max-width:914px)': [ 'billboard', 'floating' ],
		'screen and (max-width:599px)': ['mobile']
	}
});

$('.add-new-element').on('click', function () {
	const $el = $('<div class="Banner" data-ad-id="new-ad"></div>');
	const $elEmptyContent = $('<div class="Banner" data-ad-id="new-ad-empty-content"></div>');
	$('body').append($el);
	$('body').append($elEmptyContent);
	lazyads.addPlaceholder($el);
	lazyads.addPlaceholder($elEmptyContent);
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