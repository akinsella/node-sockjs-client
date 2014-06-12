'use strict';
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

/* Simplified implementation of DOM2 EventTarget.
 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 */

module.exports = REventTarget;

function REventTarget() {}

REventTarget.prototype.addEventListener = function (eventType, listener) {
    var arr;
    if (!this._listeners) {
         this._listeners = {};
    }
    if (!(eventType in this._listeners)) {
        this._listeners[eventType] = [];
    }
    arr = this._listeners[eventType];
    if (arr.indexOf(listener) === -1) {
        // Make a copy so as not to interfere with a current dispatchEvent.
        arr = arr.concat([listener]);
    }
    this._listeners[eventType] = arr;
    return;
};

REventTarget.prototype.removeEventListener = function (eventType, listener) {
    var arr,
        idx;
    if (!(this._listeners && (eventType in this._listeners))) {
        return;
    }
    arr = this._listeners[eventType];
    idx = arr.indexOf(listener);
    if (idx !== -1) {
        if (arr.length > 1) {
            // Make a copy so as not to interfer with a current dispatchEvent.
            this._listeners[eventType] = arr.slice(0, idx).concat( arr.slice(idx+1) );
        } else {
            delete this._listeners[eventType];
        }
        return;
    }
    return;
};

REventTarget.prototype.dispatchEvent = function (event) {
    var t = event.type,
        args = [].slice.call(arguments, 0),
        listeners,
        i;
    // TODO: This doesn't match the real behavior; per spec, onfoo get
    // their place in line from the /first/ time they're set from
    // non-null. Although WebKit bumps it to the end every time it's
    // set.
    if (this['on'+t]) {
        this['on'+t].apply(this, args);
    }
    if (this._listeners && t in this._listeners) {
        // Grab a reference to the listeners list. removeEventListener may
        // remove the list.
        listeners = this._listeners[t];
        for (i=0; i < listeners.length; i++) {
            listeners[i].apply(this, args);
        }
    }
};

module.exports = REventTarget;
