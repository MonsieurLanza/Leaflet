import * as Browser from '../core/Browser';
import {_pointersCount} from './DomEvent.Pointer';

/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

var _touchstart = Browser.msPointer ? 'MSPointerDown' : Browser.pointer ? 'pointerdown' : 'touchstart',
    _touchend = Browser.msPointer ? 'MSPointerUp' : Browser.pointer ? 'pointerup' : 'touchend',
    _pre = '_leaflet_';

// inspired by Zepto touch code by Thomas Fuchs
export function addDoubleTapListener (obj, handler, id) {
	var last, touch,
	    doubleTap = false,
	    delay = 250;

	function onTouchStart(e) {
		var count;

		if (Browser.pointer) {
			count = L.DomEvent._pointersCount;
		} else {
			count = e.touches.length;
		}

		if (count > 1) { return; }

		var now = Date.now(),
		    delta = now - (last || now);

		touch = e.touches ? e.touches[0] : e;
		doubleTap = (delta > 0 && delta <= delay);
		last = now;
	}

	function onTouchEnd() {
		if (doubleTap && !touch.cancelBubble) {
			if (L.Browser.pointer) {
				// work around .type being readonly with MSPointer* events
				var newTouch = {},
				    prop, i;

				for (i in touch) {
					prop = touch[i];
					newTouch[i] = prop && prop.bind ? prop.bind(touch) : prop;
				}
				touch = newTouch;
			}
			touch.type = 'dblclick';
			handler(touch);
			last = null;
		}
	}

	obj[_pre + _touchstart + id] = onTouchStart;
	obj[_pre + _touchend + id] = onTouchEnd;
	obj[_pre + 'dblclick' + id] = handler;

	obj.addEventListener(_touchstart, onTouchStart, false);
	obj.addEventListener(_touchend, onTouchEnd, false);

	// On some platforms (notably, chrome on win10 + touchscreen + mouse),
	// the browser doesn't fire touchend/pointerup events but does fire
	// native dblclicks. See #4127.
	if (!Browser.edge) {
		obj.addEventListener('dblclick', handler, false);
	}

	return this;
}

export function removeDoubleTapListener (obj, id) {
	var touchstart = obj[_pre + _touchstart + id],
	    touchend = obj[_pre + _touchend + id],
	    dblclick = obj[_pre + 'dblclick' + id];

	obj.removeEventListener(_touchstart, touchstart, false);
	obj.removeEventListener(_touchend, touchend, false);
	if (!Browser.edge) {
		obj.removeEventListener('dblclick', dblclick, false);
	}

	return this;
}
