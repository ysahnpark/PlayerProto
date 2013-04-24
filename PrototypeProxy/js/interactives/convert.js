/*jslint nomen: true */
/*global define */

define(['underscore'], function (_) {
    'use strict';

    function convert(text) {
        return _.escape(text);
    }

    return convert;
});