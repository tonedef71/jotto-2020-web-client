(function (scope, bundled) {
	
	var   enyo     = scope.enyo || (scope.enyo = {})
		, manifest = enyo.__manifest__ || (defineProperty(enyo, '__manifest__', {value: {}}) && enyo.__manifest__)
		, exported = enyo.__exported__ || (defineProperty(enyo, '__exported__', {value: {}}) && enyo.__exported__)
		, require  = enyo.require || (defineProperty(enyo, 'require', {value: enyoRequire}) && enyo.require)
		, local    = bundled()
		, entries;

	// below is where the generated entries list will be assigned if there is one
	entries = null;


	if (local) {
		Object.keys(local).forEach(function (name) {
			var value = local[name];
			if (manifest.hasOwnProperty(name)) {
				if (!value || !(value instanceof Array)) return;
			}
			manifest[name] = value;
		});
	}

	function defineProperty (o, p, d) {
		if (Object.defineProperty) return Object.defineProperty(o, p, d);
		o[p] = d.value;
		return o;
	}
	
	function enyoRequire (target) {
		if (!target || typeof target != 'string') return undefined;
		if (exported.hasOwnProperty(target))      return exported[target];
		var   request = enyo.request
			, entry   = manifest[target]
			, exec
			, map
			, ctx
			, reqs
			, reqr;
		if (!entry) throw new Error('Could not find module "' + target + '"');
		if (!(entry instanceof Array)) {
			if (typeof entry == 'object' && (entry.source || entry.style)) {
				throw new Error('Attempt to require an asynchronous module "' + target + '"');
			} else if (typeof entry == 'string') {
				throw new Error('Attempt to require a bundle entry "' + target + '"');
			} else {
				throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
			}
		}
		exec = entry[0];
		map  = entry[1];
		if (typeof exec != 'function') throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
		ctx  = {exports: {}};
		if (request) {
			if (map) {
				reqs = function (name) {
					return request(map.hasOwnProperty(name) ? map[name] : name);
				};
				defineProperty(reqs, 'isRequest', {value: request.isRequest});
			} else reqs = request;
		}
		reqr = !map ? require : function (name) {
			return require(map.hasOwnProperty(name) ? map[name] : name);
		};
		exec(
			ctx,
			ctx.exports,
			scope,
			reqr,
			reqs
		);
		return exported[target] = ctx.exports;
	}

	// in occassions where requests api are being used, below this comment that implementation will
	// be injected
	

	// if there are entries go ahead and execute them
	if (entries && entries.forEach) entries.forEach(function (name) { require(name); });
})(this, function () {
	// this allows us to protect the scope of the modules from the wrapper/env code
	return {'layout/FittableLayout':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/FittableLayout~FittableLayout}, {@link module:layout/FittableLayout~FittableColumnsLayout}
* and {@link module:layout/FittableLayout~FittableRowsLayout} kinds.
* @module layout/FittableLayout
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	Control = require('enyo/Control'),
	Layout = require('enyo/Layout');

var detector = document.createElement('div'),
	flexAvailable =
		(detector.style.flexBasis !== undefined) ||
		(detector.style.webkitFlexBasis !== undefined) ||
		(detector.style.mozFlexBasis !== undefined) ||
		(detector.style.msFlexBasis !== undefined);

/**
* {@link module:layout/FittableLayout~FittableLayout} provides the base
* positioning and boundary logic for the fittable layout strategy. The fittable
* layout strategy is based on laying out items in either a set of rows or a set
* of columns, with most of the items having natural size, but one item expanding
* to fill the remaining space. The item that expands is labeled with the
* attribute `fit: true`.
*
* The subkinds {@link module:layout/FittableLayout~FittableColumnsLayout} and
* {@link module:layout/FittableLayout~FittableRowsLayout} (or _their_ subkinds)
* are used for layout rather than `FittableLayout` because they specify
* properties that the framework expects to be available when laying items out.
*
* When available on the platform, you can opt-in to have `FittableLayout` use
* CSS flexible box (flexbox) to implement fitting behavior on the platform for
* better performance; Enyo will fall back to JavaScript-based layout on older
* platforms. Three subtle differences between the flexbox and JavaScript
* implementations should be noted:

* - When using flexbox, vertical margins (i.e., `margin-top`, `margin-bottom`) will
* not collapse; when using JavaScript layout, vertical margins will collapse according
* to static layout rules.
*
* - When using flexbox, non-fitting children of the Fittable must not be sized
* using percentages of the container (even if set to `position: relative`);
* this is explicitly not supported by the flexbox 2013 spec.
*
* - The flexbox-based Fittable implementation will respect multiple children
* with `fit: true` (the fitting space will be divided equally between them).
* This is NOT supported by the JavaScript implementation, and you should not rely
* upon this behavior if you are deploying to platforms without flexbox support.
*
* The flexbox implementation was added to Enyo 2.5.0 as an optional performance
* optimization; to use the optimization, set `useFlex: true` on the Fittable
* container.  This will cause flexbox to be used when possible.
*
* @class FittableLayout
* @extends module:enyo/Layout~Layout
* @public
*/
var FittableLayout = module.exports = kind(/** @lends module:layout/FittableLayout~FittableLayout.prototype */{
	name: 'enyo.FittableLayout',

	/**
	* @private
	*/
	kind: Layout,

	/**
	* @private
	*/
	noDefer: true,

	/**
	* @method
	* @private
	*/
	constructor: function () {
		Layout.prototype._constructor.apply(this, arguments);

		// Add the force-ltr class if we're in RTL mode, but this control is set explicitly to NOT be in RTL mode.
		this.container.addRemoveClass('force-left-to-right', (Control.prototype.rtl && !this.container.get('rtl')) );

		// Flexbox optimization is determined by global flexAvailable and per-instance opt-in useFlex flag
		this.useFlex = flexAvailable && (this.container.useFlex === true);
		if (this.useFlex) {
			this.container.addClass(this.flexLayoutClass);
		} else {
			this.container.addClass(this.fitLayoutClass);
		}
	},

	/**
	* @private
	*/
	calcFitIndex: function () {
		var aChildren = this.container.children,
			oChild,
			n;

		for (n=0; n<aChildren.length; n++) {
			oChild = aChildren[n];
			if (oChild.fit && oChild.showing) {
				return n;
			}
		}
	},

	/**
	* @private
	*/
	getFitControl: function () {
		var aChildren = this.container.children,
			oFitChild = aChildren[this.fitIndex];

		if (!(oFitChild && oFitChild.fit && oFitChild.showing)) {
			this.fitIndex = this.calcFitIndex();
			oFitChild = aChildren[this.fitIndex];
		}
		return oFitChild;
	},

	/**
	* @private
	*/
	shouldReverse: function () {
		return this.container.rtl && this.orient === 'h';
	},
	
	/**
	* @private
	*/
	destroy: function () {
		Layout.prototype.destroy.apply(this, arguments);
		
		if (this.container) {
			this.container.removeClass(this.useFlex ? this.flexLayoutClass : this.fitLayoutClass);
		}
	},

	/**
	* @private
	*/
	getFirstChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[aChildren.length - 1];
		} else {
			return aChildren[0];
		}
	},

	/**
	* @private
	*/
	getLastChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[0];
		} else {
			return aChildren[aChildren.length - 1];
		}
	},

	/**
	* @private
	*/
	getShowingChildren: function() {
		var a = [],
			n = 0,
			aChildren = this.container.children,
			nLength   = aChildren.length;

		for (;n<nLength; n++) {
			if (aChildren[n].showing) {
				a.push(aChildren[n]);
			}
		}

		return a;
	},

	/**
	* @private
	*/
	_reflow: function(sMeasureName, sClienMeasure, sAttrBefore, sAttrAfter) {
		this.container.addRemoveClass('enyo-stretch', !this.container.noStretch);
		
		var oFitChild       = this.getFitControl(),
			oContainerNode  = this.container.hasNode(),  // Container node
			nTotalSize     = 0,                          // Total container width or height without padding
			nBeforeOffset   = 0,                         // Offset before fit child
			nAfterOffset    = 0,                         // Offset after fit child
			oPadding,                                    // Object containing t,b,r,l paddings
			oBounds,                                     // Bounds object of fit control
			oLastChild,
			oFirstChild,
			nFitSize;

		if (!oFitChild || !oContainerNode) { return true; }

		oPadding   = dom.calcPaddingExtents(oContainerNode);
		oBounds    = oFitChild.getBounds();
		nTotalSize = oContainerNode[sClienMeasure] - (oPadding[sAttrBefore] + oPadding[sAttrAfter]);

		// If total size is zero, there's nothing for us to do (and the Control
		// we're doing layout for is probably hidden). In this case, we
		// short-circuit and return `true` to signify that we want to reflow
		// again the next time the Control is shown.
		if (nTotalSize === 0) {
			return true;
		}

		if (this.shouldReverse()) {
			oFirstChild  = this.getFirstChild();
			nAfterOffset = nTotalSize - (oBounds[sAttrBefore] + oBounds[sMeasureName]);

			var nMarginBeforeFirstChild = dom.getComputedBoxValue(oFirstChild.hasNode(), 'margin', sAttrBefore) || 0;

			if (oFirstChild == oFitChild) {
				nBeforeOffset = nMarginBeforeFirstChild;
			} else {
				var oFirstChildBounds      = oFirstChild.getBounds(),
					nSpaceBeforeFirstChild = oFirstChildBounds[sAttrBefore] - (oPadding[sAttrBefore] || 0);

				nBeforeOffset = oBounds[sAttrBefore] + nMarginBeforeFirstChild - nSpaceBeforeFirstChild;
			}
		} else {
			oLastChild    = this.getLastChild();
			nBeforeOffset = oBounds[sAttrBefore] - (oPadding[sAttrBefore] || 0);

			var nMarginAfterLastChild = dom.getComputedBoxValue(oLastChild.hasNode(), 'margin', sAttrAfter) || 0;

			if (oLastChild == oFitChild) {
				nAfterOffset = nMarginAfterLastChild;
			} else {
				var oLastChildBounds = oLastChild.getBounds(),
					nFitChildEnd     = oBounds[sAttrBefore] + oBounds[sMeasureName],
					nLastChildEnd    = oLastChildBounds[sAttrBefore] + oLastChildBounds[sMeasureName] +  nMarginAfterLastChild;

				nAfterOffset = nLastChildEnd - nFitChildEnd;
			}
		}

		nFitSize = nTotalSize - (nBeforeOffset + nAfterOffset);
		oFitChild.applyStyle(sMeasureName, nFitSize + 'px');
	},

	/**
	* Assigns any static layout properties not dependent on changes to the
	* rendered component or container sizes, etc.
	* 
	* @public
	*/
	flow: function() {
		if (this.useFlex) {
			var i,
				children = this.container.children,
				child;
			this.container.addClass(this.flexLayoutClass);
			this.container.addRemoveClass('nostretch', this.container.noStretch);
			for (i=0; i<children.length; i++) {
				child = children[i];
				child.addClass('enyo-flex-item');
				child.addRemoveClass('flex', child.fit);
			}
		}
	},

	/**
	* Updates the layout to reflect any changes made to the layout container or
	* the contained components.
	*
	* @public
	*/
	reflow: function() {
		if (!this.useFlex) {
			if (this.orient == 'h') {
				return this._reflow('width', 'clientWidth', 'left', 'right');
			} else {
				return this._reflow('height', 'clientHeight', 'top', 'bottom');
			}
		}
	},

	/**
	* @private
	* @lends module:layout/FittableLayout~FittableLayout.prototype
	*/
	statics: {
		/**
		* Indicates whether flexbox optimization can be used.
		*
		* @type {Boolean}
		* @default  false
		* @private
		*/
		flexAvailable: flexAvailable
	}
});

/**
* {@link module:layout/FittableLayout~FittableColumnsLayout} provides a
* container in which items are laid out in a set of vertical columns, with most
* of the items having natural size, but one expanding to fill the remaining
* space. The one that expands is labeled with the attribute `fit: true`.
*
* `FittableColumnsLayout` is meant to be used as a value for the `layoutKind`
* property of other kinds. `layoutKind` provides a way to add layout behavior in
* a pluggable fashion while retaining the ability to use a specific base kind.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableColumnsLayout
* @extends module:layout/FittableLayout~FittableLayout
* @public
*/

/**
* The declaration for {@link module:layout/FittableLayout~FittableColumnsLayout}
*/
module.exports.Columns = kind(/** @lends module:layout/FittableLayout~FittableColumnsLayout.prototype */{
	name        : 'enyo.FittableColumnsLayout',
	kind        : FittableLayout,
	orient      : 'h',
	fitLayoutClass : 'enyo-fittable-columns-layout',
	flexLayoutClass: 'enyo-flex-container columns'
});


/**
* {@link module:layout/FittableLayout~FittableRowsLayout} provides a container
* in which items are laid out in a set of horizontal rows, with most of the
* items having natural size, but one expanding to fill the remaining space. The
* one that expands is labeled with the attribute `fit: true`.
*
* `FittableRowsLayout` is meant to be used as a value for the `layoutKind`
* property of other kinds. `layoutKind` provides a way to add layout behavior in
* a pluggable fashion while retaining the ability to use a specific base kind.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableRowsLayout
* @extends module:layout/FittableLayout~FittableLayout
* @public
*/

/**
* The declaration for {@link module:layout/FittableLayout~FittableRowsLayout}
*/
module.exports.Rows = kind(
	/** @lends module:layout/FittableLayout~FittableRowsLayout.prototype */ {

	/**
	* @private
	*/
	name        : 'enyo.FittableRowsLayout',

	/**
	* @private
	*/
	kind        : FittableLayout,

	/**
	* Layout CSS class used to fit rows.
	*
	* @type {String}
	* @default 'enyo-fittable-rows-layout'
	* @public
	*/
	fitLayoutClass : 'enyo-fittable-rows-layout',

	/**
	* The orientation of the layout.
	*
	* @type {String}
	* @default 'v'
	* @public
	*/
	orient      : 'v',

	/**
	* @private
	*/
	flexLayoutClass: 'enyo-flex-container rows'
});

}],'layout/FittableColumns':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/FittableColumns~FittableColumns} kind.
* @module layout/FittableColumns
*/

var
	kind = require('enyo/kind');

var
	FittableLayout = require('./FittableLayout'),
	FittableColumnsLayout = FittableLayout.Columns;

/**
* {@link module:layout/FittableColumns~FittableColumns} provides a container in which items are laid out in a
* set of vertical columns, with most items having natural size, but one
* expanding to fill the remaining space. The one that expands is labeled with
* the attribute `fit: true`.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableColumns
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(/** @lends module:layout/FittableColumns~FittableColumns.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.FittableColumns',

	/**
	* A {@glossary kind} used to manage the size and placement of child
	* [components]{@link module:enyo/Component~Component}.
	*
	* @type {String}
	* @default ''
	* @private
	*/
	layoutKind: FittableColumnsLayout,

	/**
	* By default, items in columns stretch to fit vertically; set to `true` to
	* avoid this behavior.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	noStretch: false
});

},{'./FittableLayout':'layout/FittableLayout'}],'layout/FittableRows':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/FittableRows~FittableRows} kind.
* @module layout/FittableRows
*/

var
	kind = require('enyo/kind')	;

var
	FittableLayout = require('./FittableLayout'),
	FittableRowsLayout = FittableLayout.Rows;

/**
* {@link module:layout/FittableRows~FittableRows} provides a container in which items are laid out in a
* set	of horizontal rows, with most of the items having natural size, but one
* expanding to fill the remaining space. The one that expands is labeled with
* the attribute `fit: true`.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableRows
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(/** @lends module:layout/FittableRows~FittableRows.prototype */{

	/**
	* @private
	*/
	name: 'enyo.FittableRows',

	/**
	* A {@glossary kind} used to manage the size and placement of child
	* [components]{@link module:enyo/Component~Component}.
	*
	* @type {String}
	* @default ''
	* @private
	*/
	layoutKind: FittableRowsLayout,

	/**
	* By default, items in columns stretch to fit horizontally; set to `true` to
	* avoid this behavior.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	noStretch: false
});

},{'./FittableLayout':'layout/FittableLayout'}]
	};

});
//# sourceMappingURL=layout.js.map