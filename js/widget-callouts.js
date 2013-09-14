/* **************************************************************************
 * $Workfile:: widget-callouts.js                                           $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link Callouts} bric.
 *
 * The callout bric creates sequential keyed blobs of HTML for highlight
 * association with a labeled, keyed image.  Can be shown individually or as 
 * a table.
 *
 * Created on		April 16, 2013
 * @author			Leslie Bondaryk
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.Callouts');

goog.require('pearson.utils.IEventManager');

// Sample Callout constructor configuration
(function()
{
var callOutConfig = {
		id: "callme",
		show: "all",
		type: "numbered",
		headers: ["Nonsense","Reactor steps"],
		textBits: [{
			key: "foo",
			type: "numbered",
			cols: ["bar",
		"1. In a closed circuit, (green) water is pumped at high pressure to the reactor core."]},
			{key: "foo",
			cols: ["bar",
		"2. Heat is generated by fission in the fuel rods in the reactor core, which heats the circulating water. Thick layers of concrete and steel or lead contain the reactor core’s radioactivity."]},
			{key: "foo2",
			cols: ["stuff",
		"3. In the steam generator, the energy from the heated water is used to boil water from a separate supply. The resulting steam moves through a pipe to a turbine."]},
			{key: "bada",
			cols: ["ish",
		"4. The steam turns the turbine, which is connected to an electricity generator. Power lines distribute the electricity. A typical reactor produces as much as a coal-fired power plant."]},
			{key: "bing",
			cols: ["credence", 
		"5. A third supply of water is used to cool the steam so it condenses into water, which is pumped back to the steam generator."]}
		]
	};
});

/**
 * A CalloutItem is used to describe the individual callouts in the configuration
 * object for the {@link pearson.brix.Callouts} bric.
 *
 * @typedef {Object} CalloutItem
 * @property {string}	key		-key used to associate this item w/ items in other
 * 								 brix usually used for highlighting.
 * @property {Array.<htmlString>}
 * 						cols	-Formatted information that describes the callout item.
 * 								 each element is a different category of info, meant
 * 								 to be displayed in a different column of the item row.
 *
 */
pearson.brix.CalloutItem;
	
/* **************************************************************************
 * Callouts	                                                           */ /**
 *
 * Constructor function for Callouts brix.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this widget
 * @param {string}		config.id		-String to uniquely identify this widget
 * @param {string}		config.type 	-switch to autogenerate "numbered"
 * @param {string}		config.show		-String to specify "all" or one row (null)
 * @param {Array}		config.headers 	-strings to specify headers on table (optional)
 * @param {!Array.<!pearson.brix.CalloutItem>}
 * 						config.textBits	-list of all the callout items to be presented
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @todo there is a desire to show all text when in landscape, but just 
 * the highlighted text in portrait, and I'm not sure how best to achieve that.
 *
 * @classdesc
 * The callout widget creates HTML blobs of explanatory (callout) text. 
 * They are designed to be used with a keyed, interactive image and appear
 * either one at a time or highlighted one at a time when the user clicks on 
 * related tags over an image.
 *
 **************************************************************************/
pearson.brix.Callouts = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the bric
	 * @private
	 * @type {string}
	 */
	this.calloutsId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.Callouts);

	this.textBits = config.textBits;
	this.headers = config.headers;
	this.type = config.type;
	this.show = config.show;

	/**
	 * The event manager to use to publish (and subscribe to) events for this bric
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

	/**
	 * The event id published when the user selects a particular callout item.
	 * @const
	 * @type {string}
	 */
	this.selectedEventId = this.calloutsId_ + '_Callout';
	 	
}; // end of Callouts constructor
goog.inherits(pearson.brix.Callouts, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids 
 * @const
 * @type {string}
 */
pearson.brix.Callouts.autoIdPrefix = "callout_auto_";

/* **************************************************************************
 * Callouts.draw                                                       */ /**
 *
 * "draw" this Callouts bric at the end of the given container, by appending
 * a new element tree representation to that container.
 * @export
 *
 * @param {!d3.selection}
 *					container	-The container html element to append the callouts
 *								 element tree to.
 *
 ****************************************************************************/
pearson.brix.Callouts.prototype.draw = function (container)
{
	// @todo this.node property really should be this.lastdrawn.container -mjl 7-22-2013
	this.node = container;
	
	var numLabels = this.textBits.length;
	
	var that = this;
	//this.rootEl = <div>A bunch of text that swaps here and has visibility set</div>
	//TODO make the class or the style so that these stack up and only one is visible
	//use the event handlers
	this.rootEl = this.node.append("div").attr("id", this.calloutsId_);
	
	var table = this.rootEl.append("table").attr("class", "widgetCallout");
		
	if(this.headers){
		var headRow = table.append("thead").append("tr");
			headRow.selectAll("td").data(this.headers).enter()
				.append("td")
					.html(function(d) {
							return d;
							});
		}
	//Show the data in a table
	this.calloutCollection = table.append("tbody").selectAll("tr.widgetCallout")
		.data(this.textBits);
					
	this.rows = this.calloutCollection.enter().append("tr").attr("class","widgetCallout");
	//creates as many rows as there are elements in textBits
	//	.attr("id", function(d,i) {
			//if a key is specified, append that to the ID for the row,
			//if not, use the row index. For highlighting and show/hide
	//		return that.id + (d.key ? d.key : i.toString());
	//		});
		
	// autokey entries which have no key with the data index
	this.calloutCollection.each(function (d, i) { 
					// if there is no key assigned, make one from the index
					d.key = 'key' in d ? d.key : i.toString();
					});
	

	this.rows.selectAll("td")
		.data(function(d,i) {
			return d.cols;
			}) 
	//values will return one entry for each key in the data.  So, if you
	//supply col0, col1, etc., you get multiple columns.
		.enter().append("td")
		.html(function(d,i,j) {
				var label = "";
				if(that.type == "numbered"){
				label = '<span class="stepBadge">' + (j + 1) +'</span>';
				} 
				return label + d;
				});
	
	if (this.show != "all"){
		this.calloutCollection.style("display","none");
		//show the first one by default
		d3.select("#" + that.id + (that.textBits[0].key ? that.textBits[0].key : 0))
		.style("display",null);
	}

	window.console.log("Callouts made");
	
	this.calloutCollection.on('click',
		function (d, i)
			{
				that.eventManager.publish(that.selectedEventId, 
					//the second argument is the event details.   
					{selectKey: d.key});
			});
	
}; //end Callouts object draw function

/* **************************************************************************
 * lite                                                                */ /**
 *
 * Updates the Callouts widget to display the text that matches 
 * the currently selected index, lite.
 *
 * @note: this is currently all based on members of a collection having
 * ID's that have the litekey or index appended to them after the ID.
 * Handles either the one-at-a-time callOuts display or the table 
 * row highlight display.
 * @export
 *
 * @param {*}	lite	-the index or key specifying which of a
 *						 collection to lite up
 *
 ****************************************************************************/
pearson.brix.Callouts.prototype.lite = function (lite)
{
	window.console.log("TODO: log fired callout highlight/swap", lite);
	
	var unset = this.calloutCollection;
	//remove all special formatting
	unset.classed("lit",false);
	
	// if individually shown, hide all.  This is part of functionality
	// so I didn't put this in the CSS -lb
	if(this.show != "all"){
		unset
		.style("display","none");}
		
	// create a filter function that will match all instances of the liteKey
	// then find the set that matches
	var matchesLabelIndex = function (d, i) { return d.key === lite; };
	
	var selectionToLite = this.calloutCollection.filter(matchesLabelIndex);

	// Highlight the labels w/ the matching key
	selectionToLite.style("display", null);
	
	selectionToLite
		.classed("lit", true);

	if (selectionToLite.empty())
	{
		window.console.log("No key '" + lite + "' in Labels group " + this.calloutsId_);
	}
	
}; //end Callouts.lite method

