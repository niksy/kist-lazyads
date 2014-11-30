# kist-lazyads

Simple ads/banners manager. Provides async control via [Postscribe](https://github.com/krux/postscribe).

## Installation

```sh
npm install kist-lazyads --save

bower install kist-lazyads --save
```

## API

### `Lazyads(options)`

Type: `Function`

Constructor for module. Available options are:

#### selector

Type: `String`

CSS selector for element which will contain ad content.

#### context

Type: `Object`

List of contexts and their zones.

```js
{
	"screen and (min-width:1000px) and (max-width:1199px)": ["zone1","zone2","zone3"],
	"screen and (min-width:1500px)": ["zone1","zone2","zone3"],
	"screen and (min-width:915px) and (max-width:999px)": ["zone1","zone2","zone3","zone3"],
	"screen and (min-width:1200px) and (max-width:1499px)": ["zone1","zone2","zone3"],
	"screen and (min-width:728px) and (max-width:914px)": ["zone1","zone3"],
	"screen and (max-width:599px)": ["zone4"]
}
```

#### content

Type: `Object`

Ad content which will be injected inside document elements defined by `selector` and `contentIdDataProp` properties.

```js
{
	"zone1": "<b>zone1 content</b>",
	"zone2": "<span>zone2 content</span>",
	"zone3": "zone3 content",
	"zone4": "zone4 content"
}
```

#### init

Type: `Function`

Callback to run on initialization.

#### contentIdDataProp

Type: `String`

`data` property which will be used to hook with banner content.

This will inject `zone1` content inside element with `data-zone-name="zone1"`

```js
{
	contentIdDataProp: 'zone-name'
}
```

```html
<div data-zone-name="zone1"></div>
```

#### classes

Type: `Object`

HTML clasess for DOM elements.

```js
{
	banner: 'kist-Lazyads-banner',
	isLoaded: 'is-loaded',
	isHidden: 'is-hidden'
}
```

### `.control(options)`

Type: `Function`
Returns: `Lazyads`

Provides individual control of ads/banners based on specific conditions. Available options are:

#### name

Type: `String`

Name of control. Options with same name will be merged.

#### condition

Type: `Function`
Arguments: [jQuery object]

Condition on which this controls `callback` method will be run.

#### callback

Type: `Function`
Arguments: [`el`, `emit`, `waitForLayout`]

Callback to run when condition is true.

##### el

Type: `jQuery`

Ad/banner element on which callback was run.

##### emit

Type: `Function`
Arguments: [Event to emit]

Event emit method accepts one argument. Emitted event has form of `[Provided argument]:[Control name]` and is triggered on corresponding ad/banner element.

##### waitForLayout

Type: `Function`
Arguments: [`cb`, `timeout`]

Alias for `setTimeout`. Default timeout is `300`.

### `.destroy`

Type: `Function`
Returns: `Lazyads`

Destroys current Lazyads instance.

## Examples

```js
var lazyads = require('kist-lazyads');

var ads = new lazyads({
	selector: '.Banner',
	context: {
		"screen and (min-width:1000px) and (max-width:1199px)": ["zone1","zone2","zone3"],
		"screen and (min-width:1500px)": ["zone1","zone2","zone3"],
		"screen and (min-width:915px) and (max-width:999px)": ["zone1","zone2","zone3","zone3"],
		"screen and (min-width:1200px) and (max-width:1499px)": ["zone1","zone2","zone3"],
		"screen and (min-width:728px) and (max-width:914px)": ["zone1","zone3"],
		"screen and (max-width:599px)": ["zone4"]
	},
	content: {
		"zone1": "<b>zone1 content</b>",
		"zone2": "<span>zone2 content</span>",
		"zone3": "zone3 content",
		"zone4": "zone4 content"
	},
	init: function () {
		console.log('Lazyads initialized!');
	}
});

ads
	.control({
		name: 'zone1',
		condition: function ( el ) {
			return el.data('zone-name') === 'zone1';
		},
		callback: function ( el, emit, wait ) {
			if ( el.hasClass('is-loaded') ) {
				if ( el.hasClass('is-hidden') ) {
					console.log(1);
					emit('foo');
				}
			}
		}
	})
	.control({
		name: 'zone4',
		condition: function ( el ) {
			return el.data('zone-name') === 'zone4';
		},
		callback: function ( el, emit, wait ) {
			console.log(2);
		}
	});

$('[data-zone-name="zone1"]').on('foo:zone1', function ( e, el ) {
	console.log(arguments);
});

$(document).on('foo:zone1', function ( e, el ) {
	console.log(e.currentTarget);
	console.log(e.target);
});
```

```html
<data class="Banner" data-zone-name="zone1"></div>
<data class="Banner" data-zone-name="zone2"></div>
<data class="Banner" data-zone-name="zone3"></div>
<data class="Banner" data-zone-name="zone4"></div>
```

### AMD and global

```js
define(['kist-lazyads'], cb);

window.$.kist.lazyads;
```

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
