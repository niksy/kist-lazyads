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

Ad content which will be injected inside document elements defined by `el` and `contentIdDataProp` properties.

```js
{
	"zone1": "<b>zone1 content</b>",
	"zone2": "<span>zone2 content</span>",
	"zone3": "zone3 content",
	"zone4": "zone4 content"
}
```

#### contentIdDataProp

Type: `String`

`data` property which will be used to connect with ad content.

This will inject `zone1` content inside element with `data-ad-id="zone1"`

```js
{
	contentIdDataProp: 'ad-id'
}
```

```html
<div data-ad-id="zone1"></div>
```

#### alreadyLoadedFilter

Type: `Function`
Returns: `Boolean`

By default, banners are considered not loaded until Lazyads is initialized. You may have some banners which already have some content before initialization (e.g. you may be using synchronous delivery for specific banners). Using this filter you can check for those banners and flag them as loaded at start.

| Argument | Type | Description |
| --- | --- | --- |
| `el` | `jQuery` | Banner element. |

```js
{
	alreadyLoadedFilter: function ( el ) {
		return el.hasClass('is-loaded');
	}
}
```

#### emptyContentFilter

Type: `Function`
Returns: `Boolean`

By default, banner is considered empty if it returns (trimmed) empty string for its content. Filter can be used to set custom test for content emptyness. It should return `true` if content is empty.

| Argument | Type | Description |
| --- | --- | --- |
| `content` | `String` | Banner content. |

```js
{
	emptyContentFilter: function ( content ) {
		return content.trim() === '';
	}
}
```

```html
<div data-ad-id="zone1"></div>
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

### `.recheckControl()`

Type: `Function`
Returns `Lazyads`

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
	alreadyLoadedFilter: function ( el ) {
		return el.hasClass('is-loaded');
	},
	emptyContentFilter: function ( content ) {
		return content.trim() === '';
	}
});

lazyads
	.control({
		name: 'zone1',
		condition: function ( el ) {
			return el.data('ad-id') === 'zone1';
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
			return el.data('ad-id') === 'zone4';
		},
		callback: function ( el, emit, wait ) {
			console.log(2);
		}
	})
	.init(function () {
		console.log('Lazyads initialized!');
	});

$('[data-ad-id="zone1"]').on('foo:zone1', function ( e, el ) {
	console.log(arguments);
});

$(document).on('foo:zone1', function ( e, el ) {
	console.log(e.currentTarget);
	console.log(e.target);
});
```

```html
<data class="Banner" data-ad-id="zone1"></div>
<data class="Banner" data-ad-id="zone2"></div>
<data class="Banner" data-ad-id="zone3"></div>
<data class="Banner" data-ad-id="zone4"></div>
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
