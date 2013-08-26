/* **************************************************************************
 * $Workfile:: widget-MultiSelectQuestion.js                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the MultiSelectQuestion widget.
 *
 * The MultiSelectQuestion widget displays a question and a set of possible
 * answers. 
 * This is analogous to MultipleChoiceQuestion with the difference that many 
 * selections (max configurable) is possible.
 *
 * Created on		July 29, 2013
 * @author			Young-Suk Ahn
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.MultiSelectQuestion');

// Sample configuration objects for classes defined here
(function()
{
	var Q1Choices =
	[
		{
			content: "Because as the population increases, the absolute number of births increases even though the growth rate stays constant.",
			response: "Growth rate stays constant.",
			answerKey: "correct"
		},
		{
			content: "Because the growth rate increases as the population rises.",
			response: "Does the growth rate change with population size?",
			answerKey: "wrong1"
		},
		{
			content: "Because the total fertility rate increases with population.",
			response: "Does the fertility rate change with population size?",
			answerKey: "wrong2"
	
		},
		{
			content: "Because social behaviors change and people decide to have more children.",
			response: "This might happen but is it something is necessarily occurs?",
			answerKey: "wrong3"
		}
	];
	
	// CheckButton widget config
	var rbConfig =
		{
			id: "RG1",
			choices: Q1Choices,
			numberFormat: "latin-upper"
		};
	
	// MultiSelectQuestion widget config
	var mcqConfig =
	{
		id: "Q1",
		questionId: "SanVan003",
		question: "Why?",
		choices: Q1Choices,
		maxSelects: 2,
		order: "randomized", //default, even if not specified
		widget: pearson.brix.CheckGroup,
		widgetConfig: { numberFormat: "latin-upper" } // id and choices will be added by MultiSelectQuestion
	};
});

/**
 * Answers are presented to users by certain widgets that allow the user to
 * select one (or more of them).
 *
 * @typedef {Object} Answer
 * @property {string}	content		-The content of the answer, which presents the
 * 									 meaning of the answer.
 * @property {string}	answerKey	-This is the unique ID that will be returned
 * 									 to the scoring engine to identify that the
 * 									 user has chosen this answer.
 *
 * @todo: the content currently must be text (a string) however, we are likely
 * to want to make the content be any widget.
 */


/* **************************************************************************
 * MultiSelectQuestion                                              */ /**
 *
 * Constructor function for MultiSelectQuestion brix.
 *
 * @constructor
 * @implements {IWidget}
 * @implements {IQuestion}
 * @export
 *
 * @param {Object}		config			-The settings to configure this MultiSelectQuestion
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this MultiSelectQuestion.
 * 										 if undefined a unique id will be assigned.
 * @param {string}		config.questionId
 * 										-Scoring engine Id of this question
 * @param {string}		config.question	-The question being posed to the user which should
 * 										 be answered by choosing one of the presented choices.
 * @param {Array.<Answer>}
 *						config.choices	-The list of choices (answers) to be presented
 *										 by the MultiSelectQuestion.
 * @param {int}
 *						config.maxSelects -The maximum number of items that can be selected
 *
 * @param {string|undefined}
 *						config.order	-The order in which the choices should be presented.
 *										 either "randomized" or "ordered". Default is
 *										 "randomized" if not specified.
 * @param {IWidget}		config.widget	-The constructor for a widget that presents choices.
 * @param {!Object}		config.widgetConfig
 * 										-The configuration object for the specified widget
 * 										 constructor without the id or choices properties which
 * 										 will be added by this question constructor.
 * @param {EventManager}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * The MultiSelectQuestion widget displays a question and a set of possible
 * answers one of which must be selected and submitted to be scored.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion = function (config, eventManager)
{
	/**
	 * A unique id for this instance of the select one question widget
	 * @type {string}
	 */
	this.id = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.MultiSelectQuestion);

	/**
	 * The scoring engine id of this question.
	 * @type {string}
	 */
	this.questionId = config.questionId;

	/**
	 * The question text.
	 * @type {string}
	 */
	this.question = config.question;

	/**
	 * The maximum number of allowed selects.
	 * @type {int}
	 */
	this.maxSelects = config.maxSelects;


	/**
	 * The configuration options for the widget that will display the choices that
	 * answer this question.
	 * Add an id and adjust the choices according to the question type and add them
	 * to the config.
	 * @type {Object}
	 */
	var widgetConfig = config.widgetConfig;

	widgetConfig.id = this.id + "_wdgt";

	var choices = config.choices;

	if (config.order === undefined || config.order === "randomized")
	{
		// clone the array before we rearrange it so we don't modify the
		// array passed in the config.
		choices = choices.slice(0);
		pearson.utils.randomizeArray(choices);
	}

	widgetConfig.choices = choices;

	widgetConfig.maxSelects = this.maxSelects;

	/**
	 * The widget used to present the choices that may be selected to answer
	 * this question.
	 * @type {IWidget}
	 */
	this.choiceWidget = new config.widget(widgetConfig, eventManager);

	this.buttonPromptText = "Select an answer above";
	this.buttonSubmitText = "Submit Answer";

	// The configuration options for the submit button
	var submitBtnConfig =
	{
		id: this.id + "_sbmtBtn",
		text: this.buttonPromptText,
		enabled: false
	};

	/**
	 * The button widget which allows the answer to the question to be submitted
	 * for scoring.
	 * @type {IWidget}
	 */
	this.submitButton = new pearson.brix.Button(submitBtnConfig, eventManager);

	/**
	 * List of responses that have been received for all submitted
	 * scoring requests.
	 * @type {Array.<Object>}
	 */
	this.responses = [];

	/**
	 * The event manager to use to publish (and subscribe to) events for this widget
	 * @type {EventManager}
	 */
	this.eventManager = eventManager;

	/**
	 * The event id published when a choice in this question is selected.
	 * @const
	 * @type {string}
	 */
	this.selectedEventId = this.choiceWidget.selectedEventId;

	/**
	 * The event details for this.selectedEventId events
	 * @typedef {Object} SelectedEventDetails
	 * @property {string} selectKey	-The answerKey associated with the selected answer.
	 */

	/**
	 * The event id published when the submit button is clicked.
	 * @const
	 * @type {string}
	 */
	this.submitScoreRequestEventId = this.id + "_submitAnswerRequest";

	/**
	 * The event details for this.submitScoreRequestEventId events
	 * @typedef {Object} SubmitAnswerRequest
	 * @property {SelecOneQuestion} question	-This question widget
	 * @property {string} 			questionId	-The id which identifies this question to the scoring engine.
	 * @property {string} 			answerKey	-The answerKey associated with the selected answer.
	 * @property {function(Object)}	responseCallback
	 * 											-[optional] function to call with the response when it is
	 * 											 returned by the scoring engine.
	 */

	// subscribe to events of our 'child' widgets
	var that = this;
	eventManager.subscribe(this.submitButton.pressedEventId, function () {that.handleSubmitRequested_();});
	eventManager.subscribe(this.choiceWidget.selectedEventId, function (evt) {that.handleAnswerSelected_(evt);});
	eventManager.subscribe(this.choiceWidget.exceedSelectionEventId, function () {that.handleExceedSelection_();});

	/**
	 * Information about the last drawn instance of this widget (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			widgetGroup: null,
		};
} // end of MultiSelectQuestion constructor

/**
 * Prefix to use when generating ids for instances of MultiSelectQuestion.
 * @const
 * @type {string}
 */
pearson.brix.MultiSelectQuestion.autoIdPrefix = "mcQ_auto_";

/* **************************************************************************
 * MultiSelectQuestion.handleSubmitRequested_                       */ /**
 *
 * Handle the pressed event from the submit button which means that we want
 * to fire the submit answer requested event.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleSubmitRequested_ = function()
{
	var that = this;
	var answerKeys = [].map.call(this.choiceWidget.selectedItems(), function(item){
		return item.answerKey;
	});
	// NOTICE: the value of answerKey attribute is an array of keys
	var submitAnsDetails =
		{
			question: this,
			questionId: this.questionId,
			answerKey: answerKeys,
			responseCallback: function (responseDetails) { that.handleSubmitResponse_(responseDetails); }
		};

	this.eventManager.publish(this.submitScoreRequestEventId, submitAnsDetails);
};

/* **************************************************************************
 * MultiSelectQuestion.handleAnswerSelected_             */ /**
 *
 * Handle the selected event from the choice widget which means that the
 * submit button can be enabled.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleAnswerSelected_ = function(evt)
{
	if (evt.numSelected > 0) {
	 	this.submitButton.setText(this.buttonSubmitText);
		this.submitButton.setEnabled(true);
	}  
	else 
	{
		this.submitButton.setText(this.buttonPromptText);
		this.submitButton.setEnabled(false);
	} 
};

/* **************************************************************************
 * MultiSelectQuestion.handleExceedSelection_             */ /**
 *
 * Handle the exceedSelection event from the choice widget which means that the
 * user tried to select beyond the max number of selects.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleExceedSelection_ = function()
{
	var responseDiv = this.lastdrawn.widgetGroup.select("div.responses");

	responseDiv.append("div")
		.html("Maximum number of options have been selected.");
};


/* **************************************************************************
 * MultiSelectQuestion.handleSubmitResponse_                        */ /**
 *
 * Handle the response to submitting an answer.
 *
 * @param {Object}	responseDetails	-An object containing details about how
 * 									 the submitted answer was scored.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleSubmitResponse_ = function(responseDetails)
{
	this.responses.push(responseDetails);

	var responseDiv = this.lastdrawn.widgetGroup.select("div.responses");

	// For now just use the helper function to write the response.
	//SubmitManager.appendResponseWithDefaultFormatting(responseDiv, responseDetails);
	// YSAP - Instead of the SubmitManager (who's agnostic of the rendering mechanism)
	//        its the MCQ that renders the answer feedback.
	responseDiv.append("div")
		.html(responseDetails.feedback);
};

/* **************************************************************************
 * MultiSelectQuestion.draw                                         */ /**
 *
 * Draw this MultiSelectQuestion in the given container.
 * @export
 *
 * @param {!d3.selection}
 *					container	-The container html element to append the
 *								 question element tree to.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.draw = function(container)
{
	this.lastdrawn.container = container;
	
	// make a div to hold the select one question
	// YSAP - Let's make a catalog of all classes for styling.
	var widgetGroup = container.append("div")
		.attr("class", "widgetMultiSelectQuestion")
		.attr("id", this.id);

	var question = widgetGroup.append("p")
		.attr("class", "question")
		.text(this.question);
	
	var choiceWidgetCntr = widgetGroup.append("div")
		.attr("class", "choices");

	this.choiceWidget.draw(choiceWidgetCntr);

	var submitButtonCntr = widgetGroup.append("div")
		.attr("class", "submit");

	this.submitButton.draw(submitButtonCntr);

	widgetGroup.append("div")
		.attr("class", "responses");

	this.lastdrawn.widgetGroup = widgetGroup;

}; // end of MultiSelectQuestion.draw()

/* **************************************************************************
 * MultiSelectQuestion.selectedItem                                 */ /**
 *
 * Return the selected choice from the choice widget or null if nothing has been
 * selected.
 * @export
 *
 * @return {Object} the choice which is currently selected or null.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.selectedItems = function ()
{
	return this.choiceWidget.selectedItems();
};

/* **************************************************************************
 * MultiSelectQuestion.selectItemAtIndex                            */ /**
 *
 * Select the choice in the choice widget at the given index. If the choice is
 * already selected, do nothing. The index is the displayed choice index and
 * not the config choice index (in other words if the choices have been randomized
 * then the configuration index is NOT the displayed index).
 * @export
 *
 * @param {number}	index	-the 0-based index of the choice to mark as selected.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.selectItemAtIndex = function (index)
{
	this.choiceWidget.selectItemAtIndex(index);
};

/* **************************************************************************
 * MultiSelectQuestion.unselectItemAtIndex                            */ /**
 *
 * Unselects the choice in the choice widget at the given index. If the choice is
 * already unselected, do nothing. The index is the displayed choice index and
 * not the config choice index (in other words if the choices have been randomized
 * then the configuration index is NOT the displayed index).
 * @export
 *
 * @param {number}	index	-the 0-based index of the choice to mark as selected.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.unselectItemAtIndex = function (index)
{
	this.choiceWidget.unselectItemAtIndex(index);
};