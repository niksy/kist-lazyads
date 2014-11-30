var lazyads = require('kist-lazyads');

lazyads({
	selector: '[data-zone-name]',
	context: {
		"screen and (min-width:1000px) and (max-width:1199px)": ["billboard","skyscraper","floating"],
		"screen and (min-width:1500px)": ["billboard","skyscraper","floating","wallpaper-right","wallpaper-left"],
		"screen and (min-width:915px) and (max-width:999px)": ["billboard","skyscraper","floating","floating"],
		"screen and (min-width:1200px) and (max-width:1499px)": ["billboard","skyscraper","floating","wallpaper-right","wallpaper-left"],
		"screen and (min-width:728px) and (max-width:914px)": ["billboard","floating"],
		"screen and (max-width:599px)": ["mobile"]
	},
	content: {
		"floating": "floating",
		"wallpaper-left": "wallpaper-left",
		"wallpaper-right": "wallpaper-right",
		"billboard": "billboard",
		"mobile": "mobile",
		"skyscraper": "skyscraper"
	},
	init: function () {
		console.log('Lazyads initialized!');
	}
});

lazyads.control({
	name: 'billboard',
	condition: function ( el ) {
		return el.hasClass('billboard');
	},
	callback: function ( el, emit ) {
		if ( el.hasClass('is-loaded') ) {
			if ( el.hasClass('hidden') ) {
				emit('hide');
			} else {
				emit('show');
				emit('load');
			}
		}
	}
});
