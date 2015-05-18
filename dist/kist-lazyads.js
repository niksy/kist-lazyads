/*! kist-lazyads 0.2.2 - Simple ads manager. | Author: Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/), 2015 | License: MIT */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self);var n=f;n=n.jQuery||(n.jQuery={}),n=n.kist||(n.kist={}),n.Lazyads=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var postscribe = require(13);
var meta = require(6);

/**
 * @param  {Function} cb
 */
function success ( cb ) {
	this.setAsLoaded();
	this.isLoaded = true;
	this.isContentEmpty = false;
	cb.call(null, this.$el);
}

/**
 * @param  {Function} cb
 */
function successEmpty ( cb ) {
	this.setAsContentEmpty();
	this.hide();
	this.isLoaded = true;
	this.isContentEmpty = true;
	cb.call(null, this.$el);
}

/**
 * @param  {String} name
 * @param  {jQuery} el
 * @param  {Object} classes
 * @param  {Function} emptyContentFilter
 */
var Banner = module.exports = function ( name, el, classes, emptyContentFilter ) {
	this.name = name;
	this.$el = el;
	this.classes = classes;
	this.isLoaded = false;
	this.isContentEmpty = true;
	this.stylesheets = [];

	// This should probably be defined as prototype method
	this.emptyContentFilter = function () {
		return Boolean(emptyContentFilter.apply(this.$el[0], arguments));
	};

	this.$el.addClass(this.classes.el);
};

Banner.prototype.show = function () {
	this.$el.removeClass(this.classes.isHidden);
};

Banner.prototype.hide = function () {
	this.$el.addClass(this.classes.isHidden);
};

Banner.prototype.setAsLoaded = function () {
	this.$el.addClass(this.classes.isLoaded);
};

Banner.prototype.setAsContentEmpty = function () {
	this.$el.addClass(this.classes.isContentEmpty);
};

/**
 * @param  {String}   content
 * @param  {Function} cb
 */
Banner.prototype.write = function ( content, cb ) {

	cb = cb || $.noop;

	// If zone content is empty (or doesn’t exist, e.g. ad blocker is active),
	// we don't want to display it
	if ( this.emptyContentFilter(content) ) {
		this.$el.html(content);
		successEmpty.call(this, cb);
		return;
	}

	// If zone content doesn't need postscribe parse (and won't benefit from
	// it's modifications), just dump it to the page
	if ( /responsive_google_ad/.test(content) ) {
		this.$el.html(content);
		success.call(this, cb);
		return;
	}

	// If zone content has external stylesheets, append them for IE 8
	if ( content.match(/link.+href/) && (document.all && !document.addEventListener) ) {
		$(content).filter('link').each($.proxy(function ( index, link ) {
			var $stylesheet = $('<link rel="stylesheet" href="' + $(link).attr('href') + '" class="' + meta.ns.htmlClass + '-ieStyle" />');
			$stylesheet.appendTo('head');
			this.stylesheets.push($stylesheet);
		}, this));
	}

	postscribe(this.$el, content, $.proxy(success, this, cb));

};

Banner.prototype.destroy = function () {
	this.$el.removeClass([this.classes.el, this.classes.isHidden, this.classes.isLoaded].join(' '));
	$.each(this.stylesheets, function ( index, stylesheet ) {
		stylesheet.remove();
	});
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var unique = require(10);
var filter = require(9);
var Control = require(4);

/**
 * @param  {Object} contexts
 *
 * @return {Array}
 */
function getBannersFromContexts ( contexts ) {
	var unfiltered = [];
	$.each(contexts, function ( name, val ) {
		unfiltered = unfiltered.concat(val);
	});
	return unique(unfiltered);
}

/**
 * @param  {Banner[]} el
 * @param  {Object} options
 */
var Banners = module.exports = function ( banners, options ) {

	this.banners = banners;
	this.content = options.content;
	this.control = new Control();
	this.list = getBannersFromContexts(options.context);
	this.contentEmptyList = [];

	// Get initial empty content banners
	this.contentEmptyList = filter(this.banners, function ( banner ) {
		return banner.isLoaded && banner.isContentEmpty;
	});
	this.contentEmptyList = $.map(this.contentEmptyList, function ( banner ) {
		return banner.name;
	});

};

/**
 * Get banners with non-empty content
 *
 * @param  {String[]} arr
 *
 * @return {String[]}
 */
Banners.prototype.filterContentNonEmpty = function ( arr ) {
	return filter(arr, $.proxy(function ( val ) {
		return $.inArray(val, this.contentEmptyList) === -1;
	}, this));
};

/**
 * @param  {String[]} arr
 * @param  {Function} cb
 *
 * @return {Banner[]}
 */
Banners.prototype.get = function ( arr, cb ) {

	var banners = [];
	cb = cb || function () {
		return true;
	};

	banners = filter(this.banners, function ( banner ) {
		return $.inArray(banner.name, arr) !== -1;
	});

	return filter(banners, cb);

};

/**
 * @param  {String[]} arr
 */
Banners.prototype.show = function ( arr ) {

	var banners = this.get(arr);

	$.each(banners, $.proxy(function ( index, banner ) {
		banner.show();
		this.control.resolve(banner);
	}, this));

};

/**
 * @param  {String[]} arr
 */
Banners.prototype.hide = function ( arr ) {

	var banners = this.get(arr);

	$.each(banners, $.proxy(function ( index, banner ) {
		banner.hide();
		this.control.resolve(banner);
	}, this));

};

/**
 * @param  {String[]} arr
 */
Banners.prototype.write = function ( arr ) {

	var banners = this.get(arr, function ( banner ) {
		return !banner.isLoaded && banner.isContentEmpty;
	});

	$.each(banners, $.proxy(function ( index, banner ) {

		banner.write(this.content[banner.name], $.proxy(function () {
			if ( banner.isLoaded && banner.isContentEmpty ) {
				this.contentEmptyList.push(banner.name);
			} else {
				this.show([banner.name]);
			}
		}, this));

	}, this));

};

Banners.prototype.destroy = function () {
	$.each(this.banners, function ( index, banner ) {
		banner.destroy();
	});
	this.control.destroy();
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var difference = require(7);
var filter = require(9);

/**
 * @param  {Object}  contexts
 *
 * @return {Boolean}
 */
function isAnyContextActive ( contexts ) {
	var bool = false;
	$.each(contexts, function ( name, val ) {
		if ( val.mq.matches ) {
			bool = true;
			return false;
		}
	});
	return bool;
}

/**
 * @param  {MediaQueryList} mq
 */
function listener ( mq ) {
	if ( mq.matches ) {
		this.calculate();
	}
	if ( !isAnyContextActive(this.contexts) ) {
		this.banners.hide(this.banners.filterContentNonEmpty(this.banners.list));
	}
}

/**
 * @param  {Object} contexts
 *
 * @return {String[]}
 */
function getVisibleBanners ( contexts ) {
	var arr = [];
	$.each(contexts, function ( name, context ) {
		if ( context.mq.matches ) {
			arr = arr.concat(context.zones);
		}
	});
	return arr;
}

/**
 * @class
 *
 * @param  {Banners} banners
 * @param  {Object} rawContexts
 */
var Context = module.exports = function ( banners, rawContexts ) {

	this.banners = banners;
	this.contexts = this.transformContexts(rawContexts);

};

Context.prototype.init = function () {
	this.listen();
	this.calculate();
};

/**
 * @param  {Object} rawContexts
 *
 * @return {Object}
 */
Context.prototype.transformContexts = function ( rawContexts ) {

	var ret = {};
	var gmm = $.proxy(this.getMatchMedia, this);

	$.each(rawContexts, function ( mq, zones ) {
		ret[mq] = {
			context: mq,
			mq: gmm(mq),
			zones: zones
		};
	});

	return ret;
};

/**
 * @param {String} context
 *
 * @return {MediaQueryList}
 */
Context.prototype.getMatchMedia = function ( context ) {
	return global.matchMedia(context);
};

Context.prototype.listen = function () {

	$.each(this.contexts, $.proxy(function ( name, val ) {
		val._listener = $.proxy(listener, this);
		val.mq.addListener(val._listener);
	}, this));

};

Context.prototype.unlisten = function () {

	$.each(this.contexts, function ( name, val ) {
		val.mq.removeListener(val._listener);
	});

};

Context.prototype.calculate = function () {

	var list = this.banners.filterContentNonEmpty(this.banners.list);
	var visibleBanners = this.banners.filterContentNonEmpty(getVisibleBanners(this.contexts));

	this.banners.hide(difference(list, visibleBanners));
	this.banners.show(visibleBanners);
	this.banners.write(visibleBanners);

};

Context.prototype.destroy = function () {
	this.unlisten();
	this.contexts = {};
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

/**
 * @param  {jQuery} el
 * @param  {String} controlName
 *
 * @return {Function}
 */
function emit ( el, controlName ) {

	/**
	 * @param  {String} eventName
	 */
	return function ( eventName ) {
		el.trigger(eventName + ':' + controlName, [el]);
	};
}

/**
 * @param  {Object} ctx
 *
 * @return {Function}
 */
function waitForLayout ( ctx ) {

	/**
	 * Some banners report incorrect size so we have to take render time difference.
	 *
	 * @param  {Function} cb
	 * @param  {Number} pTimeout
	 */
	return function ( cb, timeout ) {
		setTimeout($.proxy(cb, ctx), timeout || 300);
	};
}

/**
 * @class
 *
 * @return {Control}
 */
var Control = module.exports = function () {
	this.controls = [];
};

/**
 * @type {Object}
 */
Control.prototype.defaults = {
	name: '',
	condition: function () {
		return true;
	},
	callback: $.noop
};

/**
 * @param {Object} props
 */
Control.prototype.add = function ( props ) {

	var controls = this.controls;
	var push = true;

	$.each(controls, function ( index, control ) {
		if ( control.name === props.name ) {
			$.extend(control, props);
			push = false;
			return false;
		}
	});

	if ( push ) {
		controls.push($.extend({}, this.defaults, props));
	}

};

/**
 * @param  {Banner} banner
 */
Control.prototype.resolve = function ( banner ) {

	var controls = this.controls;
	var $banner = banner.$el;

	$.each(controls, $.proxy(function ( index, control ) {
		if ( Boolean(control.condition.call($banner[0], $banner)) ) {
			control.callback.call($banner[0], $banner, emit($banner, control.name), waitForLayout(this));
		}
	}, this));

};

Control.prototype.destroy = function () {
	this.controls = [];
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var filter = require(9);
var meta = require(6);
var Banner = require(1);
var Banners = require(2);
var Context = require(3);

/**
 *
 * If content object is empty, we don’t display ads, have
 * ad blocker activated, etc., don’t do anything with ad system
 *
 * @param  {Object}  options
 *
 * @return {Boolean}
 */
function hasNecessaryData ( options ) {
	if ( $.isEmptyObject(options.content) || $.isEmptyObject(options.context) ) {
		return false;
	}
	return true;
}

/**
 * @param  {jQuery} $el
 *
 * @return {Banner[]}
 */
function getBanners ( $el ) {

	var banners = $.map($el, $.proxy(function ( el ) {
		var $el = $(el);
		return new Banner($el.data(this.options.contentIdDataProp), $el, this.options.classes, this.options.emptyContentFilter);
	}, this));

	// Initialize empty content banners
	$.each(this.options.content, function ( name, val ) {
		var banner = filter(banners, function ( banner ) {
			return banner.name === name;
		})[0];
		if ( banner.emptyContentFilter(val) ) {
			banner.write(val);
		}
	});

	return banners;
}

/**
 * @class
 *
 * @param  {Object} options
 */
var Lazyads = module.exports = function ( options ) {

	this.options = $.extend(true, {}, this.defaults, options);

	if ( !hasNecessaryData(this.options) ) {
		return this;
	}

	if ( !('matchMedia' in global) ) {
		$.error('window.matchMedia undefined.');
	}

	this.banners = new Banners(getBanners.call(this, $(this.options.el)), this.options);
	this.context = new Context(this.banners, this.options.context);

};

Lazyads.prototype.defaults = {
	el: '[data-ad-id]',
	context: {},
	content: {},
	contentIdDataProp: 'ad-id',

	/**
	 * @param  {String}  content
	 *
	 * @return {Boolean}
	 */
	emptyContentFilter: function ( content ) {
		return $.trim(content) === '';
	},

	classes: {
		el: meta.ns.htmlClass + '-item',
		isLoaded: 'is-loaded',
		isHidden: 'is-hidden',
		isContentEmpty: 'is-contentEmpty'
	}
};

/**
 * @param  {Function} cb
 *
 * @return {Lazyads}
 */
Lazyads.prototype.init = function ( cb ) {
	cb = cb || $.noop;
	if ( hasNecessaryData(this.options) && !this.active ) {
		this.active = true;
		this.context.init();
		cb.call(this.options);
	}
	return this;
};

/**
 * @param  {Object} props
 *
 * @return {Lazyads}
 */
Lazyads.prototype.control = function ( props ) {
	if ( hasNecessaryData(this.options) ) {
		this.banners.control.add(props);
	}
	return this;
};

/**
 * @return {Lazyads}
 */
Lazyads.prototype.recheckControl = function () {
	if ( hasNecessaryData(this.options) ) {
		$.each(this.banners, $.proxy(function ( index, banner ) {
			this.banners.control.resolve(banner);
		}, this));
	}
	return this;
};

/**
 * @return {Lazyads}
 */
Lazyads.prototype.destroy = function () {
	if ( hasNecessaryData(this.options) ) {
		this.banners.destroy();
		this.context.destroy();
		this.banners = null;
		this.context = null;
		this.active = false;
	}
	return this;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
module.exports = {
	name: 'lazyads',
	ns: {
		htmlClass: 'kist-Lazyads'
	}
};

},{}],7:[function(require,module,exports){
/*!
 * arr-diff <https://github.com/jonschlinkert/arr-diff>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var indexof = require(8);

/**
 * Return the difference between two arrays.
 *
 * ```js
 * var a = ['a', 'b', 'c', 'd'];
 * var b = ['b', 'c'];
 *
 * console.log(difference(a, b))
 * //=> ['a', 'd']
 * ```
 *
 * @param  {Array} `a`
 * @param  {Array} `b`
 * @return {Array}
 */

module.exports = function difference(a, b) {
  var alen = a.length - 1;
  var blen = b.length;

  if (alen === 0) {
    return [];
  }
  if (blen === 0) {
    return a;
  }

  var arr = [];

  for (var i = alen; i >= 0; i--) {
    var key = a[i];
    if (indexof(b, key) === -1) {
      arr.push(key);
    }
  }

  return arr;
};


},{}],8:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],9:[function(require,module,exports){

/**
 * Array#filter.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Object=} self
 * @return {Array}
 * @throw TypeError
 */

module.exports = function (arr, fn, self) {
  if (arr.filter) return arr.filter(fn);
  if (void 0 === arr || null === arr) throw new TypeError;
  if ('function' != typeof fn) throw new TypeError;
  var ret = [];
  for (var i = 0; i < arr.length; i++) {
    if (!hasOwn.call(arr, i)) continue;
    var val = arr[i];
    if (fn.call(self, val, i, arr)) ret.push(val);
  }
  return ret;
};

var hasOwn = Object.prototype.hasOwnProperty;

},{}],10:[function(require,module,exports){
'use strict';

var indexof = require(11);

module.exports = function (arr) {
	var ret = [];

	for (var i = 0; i < arr.length; i++) {
		if (indexof(ret, arr[i]) === -1) {
			ret.push(arr[i]);
		}
	}

	return ret;
};

},{}],11:[function(require,module,exports){
module.exports=require(8)
},{}],12:[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
// An html parser written in JavaScript
// Based on http://ejohn.org/blog/pure-javascript-html-parser/
//TODO(#39)
/*globals console:false*/
(function() {
  var supports = (function() {
    var supports = {};

    var html;
    var work = this.document.createElement('div');

    html = '<P><I></P></I>';
    work.innerHTML = html;
    supports.tagSoup = work.innerHTML !== html;

    work.innerHTML = '<P><i><P></P></i></P>';
    supports.selfClose = work.childNodes.length === 2;

    return supports;
  })();



  // Regular Expressions for parsing tags and attributes
  var startTag = /^<([\-A-Za-z0-9_]+)((?:\s+[\w\-]+(?:\s*=?\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
  var endTag = /^<\/([\-A-Za-z0-9_]+)[^>]*>/;
  var attr = /([\-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
  var fillAttr = /^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noresize|noshade|nowrap|readonly|selected)$/i;

  var DEBUG = false;

  function htmlParser(stream, options) {
    stream = stream || '';

    // Options
    options = options || {};

    for(var key in supports) {
      if(supports.hasOwnProperty(key)) {
        if(options.autoFix) {
          options['fix_'+key] = true;//!supports[key];
        }
        options.fix = options.fix || options['fix_'+key];
      }
    }

    var stack = [];

    var unescapeHTMLEntities = function(html) {
      return typeof html === 'string' ? html.replace(/(&#\d{1,4};)/gm, function(match){
        var code = match.substring(2,match.length-1);
        return String.fromCharCode(code);
      }) : html;
    };

    var append = function(str) {
      stream += str;
    };

    var prepend = function(str) {
      stream = str + stream;
    };

    // Order of detection matters: detection of one can only
    // succeed if detection of previous didn't
    var detect = {
      comment: /^<!--/,
      endTag: /^<\//,
      atomicTag: /^<\s*(script|style|noscript|iframe|textarea)[\s\/>]/i,
      startTag: /^</,
      chars: /^[^<]/
    };

    // Detection has already happened when a reader is called.
    var reader = {

      comment: function() {
        var index = stream.indexOf('-->');
        if ( index >= 0 ) {
          return {
            content: stream.substr(4, index),
            length: index + 3
          };
        }
      },

      endTag: function() {
        var match = stream.match( endTag );

        if ( match ) {
          return {
            tagName: match[1],
            length: match[0].length
          };
        }
      },

      atomicTag: function() {
        var start = reader.startTag();
        if(start) {
          var rest = stream.slice(start.length);
          // for optimization, we check first just for the end tag
          if(rest.match(new RegExp('<\/\\s*' + start.tagName + '\\s*>', 'i'))) {
            // capturing the content is inefficient, so we do it inside the if
            var match = rest.match(new RegExp('([\\s\\S]*?)<\/\\s*' + start.tagName + '\\s*>', 'i'));
            if(match) {
              // good to go
              return {
                tagName: start.tagName,
                attrs: start.attrs,
                content: match[1],
                length: match[0].length + start.length
              };
            }
          }
        }
      },

      startTag: function() {
        var match = stream.match( startTag );

        if ( match ) {
          var attrs = {};

          match[2].replace(attr, function(match, name) {
            var value = arguments[2] || arguments[3] || arguments[4] ||
              fillAttr.test(name) && name || null;

            attrs[name] = unescapeHTMLEntities(value);
          });

          return {
            tagName: match[1],
            attrs: attrs,
            unary: !!match[3],
            length: match[0].length
          };
        }
      },

      chars: function() {
        var index = stream.indexOf('<');
        return {
          length: index >= 0 ? index : stream.length
        };
      }
    };

    var readToken = function() {

      // Enumerate detects in order
      for (var type in detect) {

        if(detect[type].test(stream)) {
          if(DEBUG) { console.log('suspected ' + type); }

          var token = reader[type]();
          if(token) {
            if(DEBUG) { console.log('parsed ' + type, token); }
            // Type
            token.type = token.type || type;
            // Entire text
            token.text = stream.substr(0, token.length);
            // Update the stream
            stream = stream.slice(token.length);

            return token;
          }
          return null;
        }
      }
    };

    var readTokens = function(handlers) {
      var tok;
      while((tok = readToken())) {
        // continue until we get an explicit "false" return
        if(handlers[tok.type] && handlers[tok.type](tok) === false) {
          return;
        }
      }
    };

    var clear = function() {
      var rest = stream;
      stream = '';
      return rest;
    };

    var rest = function() {
      return stream;
    };

    if(options.fix) {
      (function() {
        // Empty Elements - HTML 4.01
        var EMPTY = /^(AREA|BASE|BASEFONT|BR|COL|FRAME|HR|IMG|INPUT|ISINDEX|LINK|META|PARAM|EMBED)$/i;

        // Elements that you can| intentionally| leave open
        // (and which close themselves)
        var CLOSESELF = /^(COLGROUP|DD|DT|LI|OPTIONS|P|TD|TFOOT|TH|THEAD|TR)$/i;


        var stack = [];
        stack.last = function() {
          return this[this.length - 1];
        };
        stack.lastTagNameEq = function(tagName) {
          var last = this.last();
          return last && last.tagName &&
            last.tagName.toUpperCase() === tagName.toUpperCase();
        };

        stack.containsTagName = function(tagName) {
          for(var i = 0, tok; (tok = this[i]); i++) {
            if(tok.tagName === tagName) {
              return true;
            }
          }
          return false;
        };

        var correct = function(tok) {
          if(tok && tok.type === 'startTag') {
            // unary
            tok.unary = EMPTY.test(tok.tagName) || tok.unary;
          }
          return tok;
        };

        var readTokenImpl = readToken;

        var peekToken = function() {
          var tmp = stream;
          var tok = correct(readTokenImpl());
          stream = tmp;
          return tok;
        };

        var closeLast = function() {
          var tok = stack.pop();

          // prepend close tag to stream.
          prepend('</'+tok.tagName+'>');
        };

        var handlers = {
          startTag: function(tok) {
            var tagName = tok.tagName;
            // Fix tbody
            if(tagName.toUpperCase() === 'TR' && stack.lastTagNameEq('TABLE')) {
              prepend('<TBODY>');
              prepareNextToken();
            } else if(options.fix_selfClose && CLOSESELF.test(tagName) && stack.containsTagName(tagName)) {
              if(stack.lastTagNameEq(tagName)) {
                closeLast();
              } else {
                prepend('</'+tok.tagName+'>');
                prepareNextToken();
              }
            } else if (!tok.unary) {
              stack.push(tok);
            }
          },

          endTag: function(tok) {
            var last = stack.last();
            if(last) {
              if(options.fix_tagSoup && !stack.lastTagNameEq(tok.tagName)) {
                // cleanup tag soup
                closeLast();
              } else {
                stack.pop();
              }
            } else if (options.fix_tagSoup) {
              // cleanup tag soup part 2: skip this token
              skipToken();
            }
          }
        };

        var skipToken = function() {
          // shift the next token
          readTokenImpl();

          prepareNextToken();
        };

        var prepareNextToken = function() {
          var tok = peekToken();
          if(tok && handlers[tok.type]) {
            handlers[tok.type](tok);
          }
        };

        // redefine readToken
        readToken = function() {
          prepareNextToken();
          return correct(readTokenImpl());
        };
      })();
    }

    return {
      append: append,
      readToken: readToken,
      readTokens: readTokens,
      clear: clear,
      rest: rest,
      stack: stack
    };

  }

  htmlParser.supports = supports;

  htmlParser.tokenToString = function(tok) {
    var handler = {
      comment: function(tok) {
        return '<--' + tok.content + '-->';
      },
      endTag: function(tok) {
        return '</'+tok.tagName+'>';
      },
      atomicTag: function(tok) {
        console.log(tok);
        return handler.startTag(tok) +
              tok.content +
              handler.endTag(tok);
      },
      startTag: function(tok) {
        var str = '<'+tok.tagName;
        for (var key in tok.attrs) {
          var val = tok.attrs[key];
          // escape quotes
          str += ' '+key+'="'+(val ? val.replace(/(^|[^\\])"/g, '$1\\\"') : '')+'"';
        }
        return str + (tok.unary ? '/>' : '>');
      },
      chars: function(tok) {
        return tok.text;
      }
    };
    return handler[tok.type](tok);
  };

  htmlParser.escapeAttributes = function(attrs) {
    var escapedAttrs = {};
    // escape double-quotes for writing html as a string

    for(var name in attrs) {
      var value = attrs[name];
      escapedAttrs[name] = value && value.replace(/(^|[^\\])"/g, '$1\\\"');
    }
    return escapedAttrs;
  };

  for(var key in supports) {
    htmlParser.browserHasFlaw = htmlParser.browserHasFlaw || (!supports[key]) && key;
  }

  this.htmlParser = htmlParser;
})();

; browserify_shim__define__module__export__(typeof htmlParser != "undefined" ? htmlParser : window.htmlParser);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function (global){

; htmlParser = global.htmlParser = require(12);
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
//     postscribe.js 1.3.2
//     (c) Copyright 2012 to the present, Krux
//     postscribe is freely distributable under the MIT license.
//     For all details and documentation:
//     http://krux.github.io/postscribe
/*globals htmlParser:false*/
(function() {
  // A function that intentionally does nothing.
  function doNothing() {}

  // Available options and defaults.
  var OPTIONS = {
    // Called when an async script has loaded.
    afterAsync: doNothing,
    // Called immediately before removing from the write queue.
    afterDequeue: doNothing,
    // Called sync after a stream's first thread release.
    afterStreamStart: doNothing,
    // Called after writing buffered document.write calls.
    afterWrite: doNothing,
    // Called immediately before adding to the write queue.
    beforeEnqueue: doNothing,
    // Called before writing buffered document.write calls.
    beforeWrite: function(str) { return str; },
    // Called when evaluation is finished.
    done: doNothing,
    // Called when a write results in an error.
    error: function(e) { throw e; },
    // Whether to let scripts w/ async attribute set fall out of the queue.
    releaseAsync: false
  };

  var global = this;

  var UNDEFINED = void 0;

  function existy(thing) {
    return thing !== UNDEFINED && thing !== null;
  }

  if(global.postscribe) {
    return;
  }

  // Turn on to debug how each chunk affected the DOM.
  var DEBUG_CHUNK = false;

  // # Helper Functions

  var slice = Array.prototype.slice;

  // Is this a function?
  function isFunction(x) {
    return 'function' === typeof x;
  }

  // Loop over each item in an array-like value.
  function each(arr, fn, _this) {
    var i, len = (arr && arr.length) || 0;
    for(i = 0; i < len; i++) {
      fn.call(_this, arr[i], i);
    }
  }

  // Loop over each key/value pair in a hash.
  function eachKey(obj, fn, _this) {
    var key;
    for(key in obj) {
      if(obj.hasOwnProperty(key)) {
        fn.call(_this, key, obj[key]);
      }
    }
  }

  // Set properties on an object.
  function set(obj, props) {
    eachKey(props, function(key, value) {
      obj[key] = value;
    });
    return obj;
  }

  // Set default options where some option was not specified.
  function defaults(options, _defaults) {
    options = options || {};
    eachKey(_defaults, function(key, val) {
      if(!existy(options[key])) {
        options[key] = val;
      }
    });
    return options;
  }

  // Convert value (e.g., a NodeList) to an array.
  function toArray(obj) {
    try {
      return slice.call(obj);
    } catch(e) {
      var ret = [];
      each(obj, function(val) {
        ret.push(val);
      });
      return ret;
    }
  }

  var last = function(array) {
    return array[array.length - 1];
  };

  // Test if token is a script tag.
  function isScript(tok) {
    return !tok || !('tagName' in tok) ? !1 : !!~tok.tagName.toLowerCase().indexOf('script');
  }

  function isStyle(tok) {
    return !tok || !('tagName' in tok) ? !1 : !!~tok.tagName.toLowerCase().indexOf('style');
  }

  // # Class WriteStream

  // Stream static html to an element, where "static html" denotes "html without scripts".

  // This class maintains a *history of writes devoid of any attributes* or "proxy history".
  // Injecting the proxy history into a temporary div has no side-effects,
  // other than to create proxy elements for previously written elements.

  // Given the `staticHtml` of a new write, a `tempDiv`'s innerHTML is set to `proxy_history + staticHtml`.
  // The *structure* of `tempDiv`'s contents, (i.e., the placement of new nodes beside or inside of proxy elements),
  // reflects the DOM structure that would have resulted if all writes had been squashed into a single write.

  // For each descendent `node` of `tempDiv` whose parentNode is a *proxy*, `node` is appended to the corresponding *real* element within the DOM.

  // Proxy elements are mapped to *actual* elements in the DOM by injecting a data-id attribute into each start tag in `staticHtml`.
  var WriteStream = (function(){

    // Prefix for data attributes on DOM elements.
    var BASEATTR = 'data-ps-';

    // get / set data attributes
    function data(el, name, value) {
      var attr = BASEATTR + name;

      if(arguments.length === 2) {
        // Get
        var val = el.getAttribute(attr);

        // IE 8 returns a number if it's a number
        return !existy(val) ? val : String(val);

      } else if(existy(value) && value !== '') {
        // Set
        el.setAttribute(attr, value);

      } else {
        // Remove
        el.removeAttribute(attr);
      }
    }

    function WriteStream(root, options) {
      var doc = root.ownerDocument;

      set(this, {
        root: root,

        options: options,

        win: doc.defaultView || doc.parentWindow,

        doc: doc,

        parser: htmlParser('', { autoFix: true }),

        // Actual elements by id.
        actuals: [root],

        // Embodies the "structure" of what's been written so far, devoid of attributes.
        proxyHistory: '',

        // Create a proxy of the root element.
        proxyRoot: doc.createElement(root.nodeName),

        scriptStack: [],

        writeQueue: []
      });

      data(this.proxyRoot, 'proxyof', 0);

    }

    WriteStream.prototype.write = function() {
      [].push.apply(this.writeQueue, arguments);
      // Process writes
      // When new script gets pushed or pending this will stop
      // because new writeQueue gets pushed
      var arg;
      while(!this.deferredRemote &&
            this.writeQueue.length) {
        arg = this.writeQueue.shift();

        if(isFunction(arg)) {
          this.callFunction(arg);
        } else {
          this.writeImpl(arg);
        }
      }
    };

    WriteStream.prototype.callFunction = function(fn) {
      var tok = { type: 'function', value: fn.name || fn.toString() };
      this.onScriptStart(tok);
      fn.call(this.win, this.doc);
      this.onScriptDone(tok);
    };

    WriteStream.prototype.writeImpl = function(html) {
      this.parser.append(html);

      var tok, tokens = [], script, style;

      // stop if we see a script token
      while((tok = this.parser.readToken()) && !(script=isScript(tok)) && !(style=isStyle(tok))) {
        tokens.push(tok);
      }

      this.writeStaticTokens(tokens);

      if(script) {
        this.handleScriptToken(tok);
      }
      if(style){
        this.handleStyleToken(tok);
      }
    };

    // ## Contiguous non-script tokens (a chunk)
    WriteStream.prototype.writeStaticTokens = function(tokens) {

      var chunk = this.buildChunk(tokens);

      if(!chunk.actual) {
        // e.g., no tokens, or a noscript that got ignored
        return;
      }
      chunk.html = this.proxyHistory + chunk.actual;
      this.proxyHistory += chunk.proxy;

      this.proxyRoot.innerHTML = chunk.html;

      if(DEBUG_CHUNK) {
        chunk.proxyInnerHTML = this.proxyRoot.innerHTML;
      }

      this.walkChunk();

      if(DEBUG_CHUNK) {
        chunk.actualInnerHTML = this.root.innerHTML; //root
      }

      return chunk;
    };

    WriteStream.prototype.buildChunk = function (tokens) {
      var nextId = this.actuals.length,

          // The raw html of this chunk.
          raw = [],

          // The html to create the nodes in the tokens (with id's injected).
          actual = [],

          // Html that can later be used to proxy the nodes in the tokens.
          proxy = [];

      each(tokens, function(tok) {

        raw.push(tok.text);

        if(tok.attrs) { // tok.attrs <==> startTag or atomicTag or cursor
          // Ignore noscript tags. They are atomic, so we don't have to worry about children.
          if(!(/^noscript$/i).test(tok.tagName)) {
            var id = nextId++;

            // Actual: inject id attribute: replace '>' at end of start tag with id attribute + '>'
            actual.push(
              tok.text.replace(/(\/?>)/, ' '+BASEATTR+'id='+id+' $1')
            );

            // Don't proxy scripts: they have no bearing on DOM structure.
            if(tok.attrs.id !== 'ps-script' && tok.attrs.id !== 'ps-style') {
              // Proxy: strip all attributes and inject proxyof attribute
              proxy.push(
                // ignore atomic tags (e.g., style): they have no "structural" effect
                tok.type === 'atomicTag' ? '' :
                  '<'+tok.tagName+' '+BASEATTR+'proxyof='+id+(tok.unary ? ' />' : '>')
              );
            }
          }

        } else {
          // Visit any other type of token
          // Actual: append.
          actual.push(tok.text);
          // Proxy: append endTags. Ignore everything else.
          proxy.push(tok.type === 'endTag' ? tok.text : '');
        }
      });

      return {
        tokens: tokens,
        raw: raw.join(''),
        actual: actual.join(''),
        proxy: proxy.join('')
      };
    };

    WriteStream.prototype.walkChunk = function() {
      var node, stack = [this.proxyRoot];

      // use shift/unshift so that children are walked in document order

      while(existy(node = stack.shift())) {

        var isElement = node.nodeType === 1;
        var isProxy = isElement && data(node, 'proxyof');

        // Ignore proxies
        if(!isProxy) {

          if(isElement) {
            // New actual element: register it and remove the the id attr.
            this.actuals[data(node, 'id')] = node;
            data(node, 'id', null);
          }

          // Is node's parent a proxy?
          var parentIsProxyOf = node.parentNode && data(node.parentNode, 'proxyof');
          if(parentIsProxyOf) {
            // Move node under actual parent.
            this.actuals[parentIsProxyOf].appendChild(node);
          }
        }
        // prepend childNodes to stack
        stack.unshift.apply(stack, toArray(node.childNodes));
      }
    };

    // ### Script tokens
    WriteStream.prototype.handleScriptToken = function(tok) {
      var remainder = this.parser.clear();

      if(remainder) {
        // Write remainder immediately behind this script.
        this.writeQueue.unshift(remainder);
      }

      //noinspection JSUnresolvedVariable
      tok.src = tok.attrs.src || tok.attrs.SRC;

      if(tok.src && this.scriptStack.length) {
        // Defer this script until scriptStack is empty.
        // Assumption 1: This script will not start executing until
        // scriptStack is empty.
        this.deferredRemote = tok;
      } else {
        this.onScriptStart(tok);
      }

      // Put the script node in the DOM.
      var _this = this;
      this.writeScriptToken(tok, function() {
        _this.onScriptDone(tok);
      });

    };

    // ### Style tokens
    WriteStream.prototype.handleStyleToken = function(tok) {
      var remainder = this.parser.clear();

      if(remainder) {
        // Write remainder immediately behind this style.
        this.writeQueue.unshift(remainder);
      }

      tok.type = tok.attrs.type || tok.attrs.TYPE || 'text/css';

      // Put the style node in the DOM.
      this.writeStyleToken(tok);

      if(remainder) {
        this.write();
      }
    };

    // Build a style and insert it into the DOM.
    WriteStream.prototype.writeStyleToken = function(tok) {
      var el = this.buildStyle(tok);

      this.insertStyle(el);

      // Set content
      if(tok.content) {
        //noinspection JSUnresolvedVariable
        if(el.styleSheet && !el.sheet) {
          el.styleSheet.cssText=tok.content;
        }
        else {
          el.appendChild(this.doc.createTextNode(tok.content));
        }
      }
    };

    // Build a style element from an atomic style token.
    WriteStream.prototype.buildStyle = function(tok) {
      var el = this.doc.createElement(tok.tagName);

      el.setAttribute('type', tok.type);
      // Set attributes
      eachKey(tok.attrs, function(name, value) {
        el.setAttribute(name, value);
      });

      return el;
    };

    // Insert style into DOM where it would naturally be written.
    WriteStream.prototype.insertStyle = function(el) {
      // Append a span to the stream. That span will act as a cursor
      // (i.e. insertion point) for the style.
      this.writeImpl('<span id="ps-style"/>');

      // Grab that span from the DOM.
      var cursor = this.doc.getElementById('ps-style');

      // Replace cursor with style.
      cursor.parentNode.replaceChild(el, cursor);
    };

    WriteStream.prototype.onScriptStart = function(tok) {
      tok.outerWrites = this.writeQueue;
      this.writeQueue = [];
      this.scriptStack.unshift(tok);
    };

    WriteStream.prototype.onScriptDone = function(tok) {
      // Pop script and check nesting.
      if(tok !== this.scriptStack[0]) {
        this.options.error({ message: 'Bad script nesting or script finished twice' });
        return;
      }
      this.scriptStack.shift();

      // Append outer writes to queue and process them.
      this.write.apply(this, tok.outerWrites);

      // Check for pending remote

      // Assumption 2: if remote_script1 writes remote_script2 then
      // the we notice remote_script1 finishes before remote_script2 starts.
      // I think this is equivalent to assumption 1
      if(!this.scriptStack.length && this.deferredRemote) {
        this.onScriptStart(this.deferredRemote);
        this.deferredRemote = null;
      }
    };

    // Build a script and insert it into the DOM.
    // Done is called once script has executed.
    WriteStream.prototype.writeScriptToken = function(tok, done) {
      var el = this.buildScript(tok);
      var asyncRelease = this.shouldRelease(el);
      var afterAsync = this.options.afterAsync;

      if(tok.src) {
        // Fix for attribute "SRC" (capitalized). IE does not recognize it.
        el.src = tok.src;
        this.scriptLoadHandler(el, !asyncRelease ? function() {
          done();
          afterAsync();
        } : afterAsync);
      }

      try {
        this.insertScript(el);
        if(!tok.src || asyncRelease) {
          done();
        }
      } catch(e) {
        this.options.error(e);
        done();
      }
    };

    // Build a script element from an atomic script token.
    WriteStream.prototype.buildScript = function(tok) {
      var el = this.doc.createElement(tok.tagName);

      // Set attributes
      eachKey(tok.attrs, function(name, value) {
        el.setAttribute(name, value);
      });

      // Set content
      if(tok.content) {
        el.text = tok.content;
      }

      return el;
    };

    // Insert script into DOM where it would naturally be written.
    WriteStream.prototype.insertScript = function(el) {
      // Append a span to the stream. That span will act as a cursor
      // (i.e. insertion point) for the script.
      this.writeImpl('<span id="ps-script"/>');

      // Grab that span from the DOM.
      var cursor = this.doc.getElementById('ps-script');

      // Replace cursor with script.
      cursor.parentNode.replaceChild(el, cursor);
    };

    WriteStream.prototype.scriptLoadHandler = function(el, done) {
      function cleanup() {
        el = el.onload = el.onreadystatechange = el.onerror = null;
      }

      // Error handler
      var error = this.options.error;

      function success() {
        cleanup();
        done();
      }

      function failure(err) {
        cleanup();
        error(err);
        done();
      }

      // Set handlers
      set(el, {
        onload: function() {
          success();
        },

        onreadystatechange: function() {
          if(/^(loaded|complete)$/.test( el.readyState )) {
            success();
          }
        },

        onerror: function() {
          failure({ message: 'remote script failed ' + el.src });
        }
      });
    };

    WriteStream.prototype.shouldRelease = function(el) {
      var isScript = /^script$/i.test(el.nodeName);
      return !isScript || !!(this.options.releaseAsync && el.src && el.hasAttribute('async'));
    };

    return WriteStream;

  }());

  // Public-facing interface and queuing
  global.postscribe = (function() {
    var nextId = 0;

    var queue = [];

    var active = null;

    function nextStream() {
      var args = queue.shift();
      var options;
      if(args) {
        options = last(args);
        options.afterDequeue();
        args.stream = runStream.apply(null, args);
        options.afterStreamStart();
      }
    }

    function runStream(el, html, options) {
      active = new WriteStream(el, options);

      // Identify this stream.
      active.id = nextId++;
      active.name = options.name || active.id;
      postscribe.streams[active.name] = active;

      // Override document.write.
      var doc = el.ownerDocument;

      var stash = {
        close: doc.close,
        open: doc.open,
        write: doc.write,
        writeln: doc.writeln
      };

      function write(str) {
        str = options.beforeWrite(str);
        active.write(str);
        options.afterWrite(str);
      }

      set(doc, {
        close: doNothing,
        open: doNothing,
        write: function(){
          return write(toArray(arguments).join(''));
        },
        writeln: function() {
          return write(toArray(arguments).join('') + '\n');
        }
      });

      // Override window.onerror
      var oldOnError = active.win.onerror || doNothing;

      // This works together with the try/catch around WriteStream::insertScript
      // In modern browsers, exceptions in tag scripts go directly to top level
      active.win.onerror = function(msg, url, line) {
        options.error({ msg: msg + ' - ' + url + ':' + line });
        oldOnError.apply(active.win, arguments);
      };

      // Write to the stream
      active.write(html, function streamDone() {
        // restore document.write
        set(doc, stash);

        // restore window.onerror
        active.win.onerror = oldOnError;

        options.done();
        active = null;
        nextStream();
      });

      return active;
    }

    function postscribe(el, html, options) {
      if(isFunction(options)) {
        options = { done: options };
      }
      options = defaults(options, OPTIONS);

      el =
        // id selector
        (/^#/).test(el) ? global.document.getElementById(el.substr(1)) :
        // jquery object. TODO: loop over all elements.
        el.jquery ? el[0] : el;


      var args = [el, html, options];

      el.postscribe = {
        cancel: function() {
          if(args.stream) {
            // TODO: implement this
            args.stream.abort();
          } else {
            args[1] = doNothing;
          }
        }
      };

      options.beforeEnqueue(args);
      queue.push(args);

      if(!active) {
        nextStream();
      }

      return el.postscribe;
    }

    return set(postscribe, {
      // Streams by name.
      streams: {},
      // Queue of streams.
      queue: queue,
      // Expose internal classes.
      WriteStream: WriteStream
    });
  }());
}());

; browserify_shim__define__module__export__(typeof postscribe != "undefined" ? postscribe : window.postscribe);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[5])(5)
});