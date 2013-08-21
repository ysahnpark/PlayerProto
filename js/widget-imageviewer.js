/* **************************************************************************
 * $Workfile:: widget-imageviewer.js                                        $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the ImageViewer widget.
 *
 * The ImageViewer widget draws the common widget configuration of a
 * Carousel widget presenting a collection of images with the selected
 * image displayed in an Image widget below the carousel.
 *
 * Created on		May 18, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.ImageViewer');

goog.require('pearson.brix.Image');
goog.require('pearson.brix.CaptionedImage');
goog.require('pearson.brix.Carousel');

// Sample configuration objects for classes defined here
(function()
{
	// config for ImageViewer class
	var imageviewerConfig =
		{
			id: "imgvwr1",
			items: [],
		};
});

/* **************************************************************************
 * ImageViewer                                                         */ /**
 *
 * The ImageViewer widget draws the common widget configuration of a
 * Carousel widget presenting a collection of images with the selected
 * image displayed in an Image widget below the carousel.
 * @export
 *
 * @constructor
 * @implements {IWidget}
 *
 * @param {Object}			config			-The settings to configure this ImageViewer
 * @param {string|undefined}
 * 							config.id		-String to uniquely identify this ImageViewer.
 * 											 if undefined a unique id will be assigned.
 * @param {Array.<Image>}	config.items	-The list of Image widgets to be presented by the ImageViewer.
 * @param {EventManager}	eventManager	-allows the widget to publish and subscribe to events
 *
 ****************************************************************************/
pearson.brix.ImageViewer = function (config, eventManager)
{
	var that = this;
	
	/**
	 * A unique id for this instance of the image viewer widget
	 * @type {string}
	 */
	this.id = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.ImageViewer);

	/**
	 * The list of widgets presented by the Carousel in this ImageViewer.
	 * @type {Array.<IWidget>}
	 */
	this.items = config.items;

	this.assignMissingItemKeys_();

	// The ImageViewer uses a standard layout of the Carousel to make its
	// configuration simpler.
	var crslConfig =
		{
			id: this.id + "_crsl",
			items: this.items,
			layout: "horizontal",
			itemMargin: {top: 4, bottom: 4, left: 2, right: 2},
			presentation: "scaleToFit",
			scrollMode: "nowrap"
		};

	/**
	 * The carousel widget used by this ImageViewer to present the images.
	 * @type {Carousel}
	 */
	this.carousel = new pearson.brix.Carousel(crslConfig, eventManager);

	// We may want to eventually support an empty image, but for now
	// we'll just copy the 1st image into the display image.
	var imgConfig =
		{
			URI: this.items[0].URI,
			caption: this.items[0].caption,
			preserveAspectRatio: this.items[0].preserveAspectRatio,
			actualSize: this.items[0].actualSize
		};

	var cimgConfig =
		{
			id: this.id + "_cimg",
			image: new Image(imgConfig),
			captionPosition: "below"
		};

	/**
	 * The captioned image widget which displays the image selected
	 * in the carousel.
	 * @type {CaptionedImage}
	 */
	this.image = new pearson.brix.CaptionedImage(cimgConfig);

	/**
	 * The event manager to use to publish (and subscribe to) events for this widget
	 * @type {EventManager}
	 */
	this.eventManager = eventManager;

	/**
	 * The event id published when an item in this carousel is selected.
	 * @const
	 * @type {string}
	 */
	this.selectedEventId = this.carousel.selectedEventId;
	
	/**
	 * The event details for this.selectedEventId events
	 * @typedef {Object} SelectedEventDetails
	 * @property {string} selectKey	-The key associated with the selected item.
	 */

	// event handler that connects the carousel selection to changing and redrawing
	// the image below.
	var handleCarouselSelection = function (eventDetails)
	{
		that.image.changeImage(that.carousel.selectedItem().URI,
							   that.carousel.selectedItem().caption);
		that.image.redraw();
	};

	eventManager.subscribe(this.carousel.selectedEventId, handleCarouselSelection);

	/**
	 * Information about the last drawn instance of this image (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			size: {height: 0, width: 0},
			widgetGroup: null,
		};
}; // end of ImageViewer constructor

/**
 * Prefix to use when generating ids for instances of ImageViewer.
 * @const
 * @type {string}
 */
pearson.brix.ImageViewer.autoIdPrefix = "imgvwr_auto_";

/* **************************************************************************
 * ImageViewer.draw                                                    */ /**
 *
 * Draw this ImageViewer in the given container.
 * @export
 *
 * @param {!d3.selection}
 *					container	-The container svg element to append the carousel element tree to.
 * @param {Size}	size		-The height and width in pixels for the carousel
 *
 ****************************************************************************/
pearson.brix.ImageViewer.prototype.draw = function(container, size)
{
	this.lastdrawn.container = container;
	this.lastdrawn.size = size;

	// aliases of utility functions for readability
	var attrFnVal = pearson.brix.utils.attrFnVal;

	var that = this;
	
	// make a group to hold the imageviewer
	var widgetGroup = container.append("g")
		.attr("class", "widgetImageViewer")
		.attr("id", this.id);

	// Rect for the background of the image viewer
	widgetGroup
		.append("rect")
			.attr("class", "background")
			.attr("width", size.width)
			.attr("height", size.height);

	// calculate the optimum carousel height for the given width, but don't let
	// it be greater than 20% of the total height of this ImageViewer.
	var carouselHeight = Math.min(this.carousel.calcOptimumHeightForWidth(size.width),
								  0.2 * size.height);

	// Carousel goes at the top
	var carouselGroup = widgetGroup.append("g");
	this.carousel.draw(carouselGroup, {height: carouselHeight, width: size.width});

	// Image goes below carousel
	var imageGroup = widgetGroup.append("g")
		.attr("transform", attrFnVal("translate", 0, carouselHeight));

	this.image.draw(imageGroup, {height: size.height - carouselHeight, width: size.width});

	this.lastdrawn.widgetGroup = widgetGroup;

	// Initial selection is the 1st image
	this.selectItemAtIndex(0);

}; // end of ImageViewer.draw()

/* **************************************************************************
 * ImageViewer.redraw                                                  */ /**
 *
 * Redrawing the ImageViewer currently does nothing.
 * @export
 *
 ****************************************************************************/
pearson.brix.ImageViewer.prototype.redraw = function ()
{
};

/* **************************************************************************
 * ImageViewer.selectedItem                                            */ /**
 *
 * Return the selected item in the carousel.
 * @export
 *
 * @return {Object} the carousel item which is currently selected.
 *
 ****************************************************************************/
pearson.brix.ImageViewer.prototype.selectedItem = function ()
{
	return this.carousel.selectedItem();
};

/* **************************************************************************
 * ImageViewer.selectItemAtIndex                                       */ /**
 *
 * Select the item in the carousel at the given index.
 * @export
 *
 * @param {number}	index	-the 0-based index of the item to flag as selected.
 *
 ****************************************************************************/
pearson.brix.ImageViewer.prototype.selectItemAtIndex = function (index)
{
	this.carousel.selectItemAtIndex(index);
};

/* **************************************************************************
 * ImageViewer.itemKeyToIndex                                          */ /**
 *
 * Find the first item in the list of items in this ImageViewer which has the
 * specified key and return its index. If no item has that key return null.
 * @export
 *
 * @param {Object}	key		-The key of the item to find
 *
 * @return {?number} the index of the item in the list of items with the
 * 			specified key.
 *
 ****************************************************************************/
pearson.brix.ImageViewer.prototype.itemKeyToIndex = function(key)
{
	return this.carousel.itemKeyToIndex(key);
};

/* **************************************************************************
 * ImageViewer.assignMissingItemKeys_                                  */ /**
 *
 * Assign a key property value of the index in the item list to any
 * item which doesn't have a key property. This key is used for selection and
 * highlighting.
 * @private
 *
 ****************************************************************************/
pearson.brix.ImageViewer.prototype.assignMissingItemKeys_ = function ()
{
	this.items.forEach(function (item, i)
					   {
						   // A falsy key is invalid, set it to the index
						   if (!item.key)
						   {
							   item.key = i.toString();
						   }
					   });
};

/* **************************************************************************
 * ImageViewer.lite                                                    */ /**
 *
 * Highlight the image(s) associated w/ the given liteKey (key) in the
 * carousel, and select the 1st highlighted image.
 * @export
 *
 * @param {string|number}	liteKey	-The key associated with the image(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.ImageViewer.prototype.lite = function (liteKey)
{
	window.console.log("called ImageViewer.lite( " + liteKey + " )");

	var i = this.itemKeyToIndex(liteKey);

	if (i !== null)
	{
		this.selectItemAtIndex(i);
	}

	this.carousel.lite(liteKey);
		
}; // end of ImageViewer.lite()

