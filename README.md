# kist-lazyads

Simple ads manager. Provides async control with [Postscribe](https://github.com/krux/postscribe).

## Installation

```sh
npm install kist-lazyads --save

bower install kist-lazyads --save
```

## API

### `Lazyads(options)`

Type: `Function`

Module class. Available options are:

#### el

Type: `String|jQuery|Element`

Element which will contain ad content. String should be valid CSS selector.

#### context

Type: `Object`

List of contexts and their ads.

```js
{
	"screen and (min-width:1000px) and (max-width:1199px)": ["ad1","ad2","ad3"],
	"screen and (min-width:1500px)": ["ad1","ad2","ad3"],
	"screen and (min-width:915px) and (max-width:999px)": ["ad1","ad2","ad3","ad3"],
	"screen and (min-width:1200px) and (max-width:1499px)": ["ad1","ad2","ad3"],
	"screen and (min-width:728px) and (max-width:914px)": ["ad1","ad3"],
	"screen and (max-width:599px)": ["ad4"]
}
```

#### contentIdDataProp

Type: `String`

`data` property which will be used to connect with ad content.

This will inject `ad1` content inside element with `data-ad-id="ad1"`

```js
{
	contentIdDataProp: 'ad-id'
}
```

```html
<div data-ad-id="ad1"></div>
```

#### classes

Type: `Object`

HTML clasess for DOM elements.

```js
{
	el: 'kist-Lazyads-item',
	isLoaded: 'is-loaded',
	isHidden: 'is-hidden',
	isContentEmpty: 'is-contentEmpty'
}
```

#### adapter

Type: `Adapter`

Adapter for banner system (e.g. Revive Ads, Google DFP, …).

### `.init(cb)`

Type: `Function`  
Returns: `Lazyads`

Initializes ad manager. **This method must be called**, either after setting up control, or after creating instance.

### `.control(options)`

Type: `Function`  
Returns: `Lazyads`

Provides individual control of ads based on specific conditions. Available options are:

#### name

Type: `String`

Name of control. Options with same name will be merged.

#### condition

Type: `Function`

Condition on which `callback` method of current control will be run.

| Argument | Type | Description |
| --- | --- | --- |
| `el` | `jQuery` | Current ad element which fullfils condition. |

#### callback

Type: `Function`

Callback to run when condition is true.

| Argument | Type | Description |
| --- | --- | --- |
| `el` | `jQuery` | Current ad element which fullfils condition. |
| `emit` | `Function` | Accepts one argument: name of event to emit. Emitted event has form of `{Provided argument}:{Control name}` and is triggered on corresponding ad element. |
| `waitForLayout` | `Function` | Alias for `setTimeout`. Default timeout is `300`. |

### `.addPlaceholder(el)`

Type: `Function`  
Returns: `Lazyads`

Dynamically creates placeholder for ad. Useful if you don’t want to display specific ad on Lazyads initialization.

#### el

Type: `String|jQuery|Element`

Element which will contain ad content. String should be valid CSS selector.

### `.recheckControl()`

Type: `Function`  
Returns: `Lazyads`

Iterates over every control entry and fires callback if condition is satisifed.

### `.destroy()`

Type: `Function`  
Returns: `Lazyads`

Destroys current Lazyads instance.

## Examples

```js
var Lazyads = require('kist-lazyads');

var lazyads = new Lazyads({
	el: '.Banner',
	context: {
		'screen and (min-width:1000px) and (max-width:1199px)': ['ad1','ad2','ad3','ad5'],
		'screen and (min-width:1500px)': ['ad1','ad2','ad3'],
		'screen and (min-width:915px) and (max-width:999px)': ['ad1','ad2','ad3','ad3','ad5'],
		'screen and (min-width:1200px) and (max-width:1499px)': ['ad1','ad2','ad3'],
		'screen and (min-width:728px) and (max-width:914px)': ['ad1','ad3','ad5'],
		'screen and (max-width:599px)': ['ad4']
	}
});

lazyads
	.control({
		name: 'ad1',
		condition: function ( el ) {
			return el.data('ad-id') === 'ad1';
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
		name: 'ad4',
		condition: function ( el ) {
			return el.data('ad-id') === 'ad4';
		},
		callback: function ( el, emit, wait ) {
			console.log(2);
		}
	})
	.init(function () {
		console.log('Lazyads initialized!');
	});

lazyads.addPlaceholder($('<div clas="Banner" data-ad-id="ad5"></div>'));

$('[data-ad-id="ad1"]').on('foo:ad1', function ( e, el ) {
	console.log(arguments);
});

$(document).on('foo:ad1', function ( e, el ) {
	console.log(e.currentTarget);
	console.log(e.target);
});
```

```html
<data class="Banner" data-ad-id="ad1"></div>
<data class="Banner" data-ad-id="ad2"></div>
<data class="Banner" data-ad-id="ad3"></div>
<data class="Banner" data-ad-id="ad4"></div>
```

### AMD and global

```js
define(['kist-lazyads'], cb);

window.$.kist.Lazyads;
```

## Browser support

Tested in IE8+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
