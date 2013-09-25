/* **************************************************************************
 * $Workfile:: briclayer.js                                                 $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the BricLayer.
 *
 * The BricLayer creates brix and connecting mortar as defined by a
 * master configuration object.
 *
 * Created on       September 10, 2013
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.BrixLayer');
goog.provide('pearson.brix.BricTypes');

goog.require('goog.object');
goog.require('pearson.utils.IEventManager');
goog.require('pearson.utils.EventManager');
goog.require('pearson.brix.BricWorks');

// brix
goog.require('pearson.brix.SVGContainer');
goog.require('pearson.brix.BarChart');
goog.require('pearson.brix.Button');
goog.require('pearson.brix.Callouts');
goog.require('pearson.brix.CaptionedImage');
goog.require('pearson.brix.Carousel');
goog.require('pearson.brix.CheckGroup');
goog.require('pearson.brix.Image');
goog.require('pearson.brix.ImageViewer');
goog.require('pearson.brix.LabelGroup');
goog.require('pearson.brix.Legend');
goog.require('pearson.brix.LineGraph');
goog.require('pearson.brix.MarkerGroup');
goog.require('pearson.brix.MultipleChoiceQuestion');
goog.require('pearson.brix.MultiSelectQuestion');
goog.require('pearson.brix.NumericInput');
goog.require('pearson.brix.NumericQuestion');
goog.require('pearson.brix.PieChart');
goog.require('pearson.brix.RadioGroup');
goog.require('pearson.brix.Readout');
goog.require('pearson.brix.SelectGroup');
goog.require('pearson.brix.Sketch');
goog.require('pearson.brix.Slider');

// mortar
// none yet


/* **************************************************************************
 * BricTypes                                                           */ /**
 *
 * This is the enumeration of all known bric types that will be registered
 * with the BricWorks instance of a BricLayer.
 *
 * @enum {string}
 *
 ****************************************************************************/
pearson.brix.BricTypes =
{
    SVGCONTAINER:           "SvgContainer",
    BARCHART:               "BarChart",
    BUTTON:                 "Button",
    CALLOUTS:               "Callouts",
    CAPTIONEDIMAGE:         "CaptionedImage",
    CAROUSEL:               "Carousel",
    CHECKGROUP:             "CheckGroup",
    IMAGE:                  "Image",
    IMAGEVIEWER:            "ImageViewer",
    LABELGROUP:             "LabelGroup",
    LEGEND:                 "Legend",
    LINEGRAPH:              "LineGraph",
    MARKERGROUP:            "MarkerGroup",
    MULTIPLECHOICEQUESTION: "MultipleChoiceQuestion",
    MULTISELECTQUESTION:    "MultiSelectQuestion",
    NUMERICINPUT:           "NumericInput",
    NUMERICQUESTION:        "NumericQuestion",
    PIECHART:               "PieChart",
    RADIOGROUP:             "RadioGroup",
    READOUT:                "Readout",
    SELECTGROUP:            "SelectGroup",
    SKETCH:                 "Sketch",
    SLIDER:                 "Slider"
};


/* **************************************************************************
 * BricLayer                                                           */ /**
 *
 * Constructor function for the BricLayer factory.
 *
 * @constructor
 *
 * @param {Object}      config          -The settings to configure this BrixLayer.
 *                                       (there are none right now so this will
 *                                       usually be specified as null or an empty object.)
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @classdesc
 * A BricLayer creates brix and connecting mortar as defined by a master
 * configuration object.
 *
 ****************************************************************************/
pearson.brix.BricLayer = function (config, eventManager)
{
    /**
     * The event manager to use to publish (and subscribe to) events for the
     * created brix and mortar.
     * @private
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager_ = eventManager || new pearson.utils.EventManager();

    /**
     * The bricWorks is the factory which builds all brix. It should
     * ONLY be accessed using the getBricWorks accessor function.
     * @private
     * @type {pearson.brix.BricWorks}
     */
    this.bricWorks_ = null;

}; // end of BricLayer constructor

/* **************************************************************************
 * BricLayer.getBricWorks                                              */ /**
 *
 * Get the BricWorks that is used by this BricLayer to create all brix.
 *
 * @returns {!pearson.brix.BricWorks}
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.getBricWorks = function ()
{
    if (this.bricWorks_)
    {
        return this.bricWorks_;
    }

    // 1st time the BricWorks was accessed, so create it.
    var bricWorks = new pearson.brix.BricWorks(null, this.eventManager_);

    // register all brix
    var BricTypes = pearson.brix.BricTypes;
    bricWorks.registerMold(BricTypes.SVGCONTAINER, pearson.brix.SVGContainer);
    bricWorks.registerMold(BricTypes.BARCHART, pearson.brix.BarChart);
    bricWorks.registerMold(BricTypes.BUTTON, pearson.brix.Button);
    bricWorks.registerMold(BricTypes.CALLOUTS, pearson.brix.Callouts);
    bricWorks.registerMold(BricTypes.CAPTIONEDIMAGE, pearson.brix.CaptionedImage);
    bricWorks.registerMold(BricTypes.CAROUSEL, pearson.brix.Carousel);
    bricWorks.registerMold(BricTypes.CHECKGROUP, pearson.brix.CheckGroup);
    bricWorks.registerMold(BricTypes.IMAGE, pearson.brix.Image);
    bricWorks.registerMold(BricTypes.IMAGEVIEWER, pearson.brix.ImageViewer);
    bricWorks.registerMold(BricTypes.LABELGROUP, pearson.brix.LabelGroup);
    bricWorks.registerMold(BricTypes.LEGEND, pearson.brix.Legend);
    bricWorks.registerMold(BricTypes.LINEGRAPH, pearson.brix.LineGraph);
    bricWorks.registerMold(BricTypes.MARKERGROUP, pearson.brix.MarkerGroup);
    bricWorks.registerMold(BricTypes.MULTIPLECHOICEQUESTION, pearson.brix.MultipleChoiceQuestion);
    bricWorks.registerMold(BricTypes.MULTISELECTQUESTION, pearson.brix.MultiSelectQuestion);
    bricWorks.registerMold(BricTypes.NUMERICINPUT, pearson.brix.NumericInput);
    bricWorks.registerMold(BricTypes.NUMERICQUESTION, pearson.brix.NumericQuestion);
    bricWorks.registerMold(BricTypes.PIECHART, pearson.brix.PieChart);
    bricWorks.registerMold(BricTypes.RADIOGROUP, pearson.brix.RadioGroup);
    bricWorks.registerMold(BricTypes.READOUT, pearson.brix.Readout);
    bricWorks.registerMold(BricTypes.SELECTGROUP, pearson.brix.SelectGroup);
    bricWorks.registerMold(BricTypes.SKETCH, pearson.brix.Sketch);
    bricWorks.registerMold(BricTypes.SLIDER, pearson.brix.Slider);

    this.bricWorks_ = bricWorks;

    return this.bricWorks_;
};

/* **************************************************************************
 * BricLayer.build                                                     */ /**
 *
 * Create all of the brix and mortar as described in the given configuration
 * object.
 *
 * @param {Object}  activityConfig      -Configuration describing the brix and
 *                                       mortar to be created.
 *
 * @returns {Object} an object containing all of the created brix and mortar.
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.build = function (activityConfig)
{
    /**
     * @dict
     */
    var building = {'info': {}, 'brix': {}, 'mortar': {}};

    building['info']['seqNodeId'] = activityConfig['sequenceNodeKey'];

    activityConfig['containerConfig'].forEach(goog.bind(this.buildContainer_, this, building));

    return building;
};

/* **************************************************************************
 * BricLayer.buildContainer_                                           */ /**
 *
 * Build all the brix and mortar specified by the given container config.
 * @private
 *
 * @param {Object}  building        -Object containing everything that's been
 *                                   built so far, and where all the new objects
 *                                   defined in this container are to be put.
 * @param {Object}  containerConfig -Configuration for all of the brix and connecting
 *                                   mortar in "container", that get rendered
 *                                   as children of a single element (usually a div).
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.buildContainer_ = function (building, containerConfig)
{
    containerConfig['brixConfig'].forEach(goog.bind(this.buildBric_, this, building));
};

/* **************************************************************************
 * BricLayer.buildBric_                                                */ /**
 *
 * Build the bric defined by the given configuration.
 * @private
 *
 * @param {Object}  building    -Object containing everything that's been
 *                               built so far, and where this new bric
 *                               is to be put.
 * @param {Object}  bricConfig  -Configuration for creating a bric.
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.buildBric_ = function (building, bricConfig)
{
    var bricWorks = this.getBricWorks();
    var id = bricConfig['bricId'];
    var type = bricConfig['bricType'];
    var config = {};
    goog.object.extend(config, bricConfig['config']);

    building['brix'][id] = bricWorks.createBric(type, config);
};

