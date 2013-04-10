/*  Aloha! and Mahalo for reading these comments.
	Most of the first half of this code is based loosely on code presented in the book:
		“JavaScript: The Definitive Guide” by David Flanagan; © 2006 O’Reily Media, Inc.; 978-0-596-10199-2;
	and has been overhauled, refined, upgraded, and otherwise heavily modified by SoftMoon-WebWare.
	The second half is based on somewhat universal ideas…

	UniDOM is a lightweight hybrid of different approaches to cross-broswer DOM compatibility and “power methods”,
	offering 3 programming styles:
	• functional programming style
		==== example:  UniDOM.removeClassName(UniDOM.getElementsByClassName(element, 'myClass')[0], 'myClass');
	• jQuery-like wrapper-based object-oriented programming style  [[untested]]
		==== example:  UniDOM(element).getElementsByClassName('myclass')[0].removeClassName('myClass');
	• inherent prototype based object-oriented programming style
		==== example:  element.getElementsByClassName('myClass')[0].removeClassName('myClass');
		(this last optional style must be specifically invoked using by calling  UniDOM.prototypify();  at the onset
		of building the webpage).

	Note there are many arguments against modifying the inherent prototypes of standard Objects.
	I feel that with this limited scope (modifying the Element prototype object),
	these arguments are basically invalid for a majority of web pages (but not all).
	Instead, I feel that it’s a much clearer programming style, with easier to read code.
*/


if (!SoftMoon)  var SoftMoon=new Object;
if (!SoftMoon.WebWare)  SoftMoon.WebWare=new Object;


if (typeof window.getComputedStyle !== 'function')  window.getComputedStyle=function(elmnt) {return elmnt.currentStyle;};

if (!Node)  { var Node=new Object;
	Node.ELEMENT_NODE=1;
	Node.ATTRIBUTE_NODE=2;
	Node.TEXT_NODE=3;
	Node.CDATA_SECTION_NODE=4;
	Node.PROCESSING_INSTRUCTION_NODE=7;
	Node.COMMENT_NODE=8;
	Node.DOCUMENT_NODE=9;
	Node.DOCUMENT_TYPE_NODE=10;
	Node.DOCUMENT_FRAGMENT_NODE=11;  }


//  UniDOM is left global for your access convienience; however, if this causes problems:
//  All of Softmoon-WebWare’s code references the UniDOM Object using  with (SoftMoon.WebWare) {}  therefore
//  UniDOM may be global or a property of SoftMoon.WebWare depending on which of the two lines below is commented-out:
var UniDOM=function(element) {
//SoftMoon.WebWare.UniDOM=function(element) {

// You may adjust the above to your needs, but remember:
// ¡ ¡ ¡ every window with a handler registered using these functions
// will have a global property:  window.UniDOM_EventHandlers   ! ! !

	if (element instanceof Element)  with (SoftMoon.WebWare)  {return new UniDOM.ElementWrapper(element);}
	else  {
		var i, wrapped=false;
		if (typeof arguments[0] == 'object'  &&  arguments[0].length)
			for (i=0, wrapped=new Array;  i<arguments[0].length;  i++)  {wrapped.push(UniDOM(arguments[0][i]));}
		return  wrapped;  }  };


with (SoftMoon.WebWare)  {

(function()  {


 /* ======The first half=========
	*
	* UniDOM  gives cross browser functionality to basic DOM Event Handling.
	* It also can reference the mouse to the element on which it hovers using:
	*  • getMouseOffset(element, event)  // returns {x,y} → the offset position from the element’s top-left corner
	*
	* For Event Handling, 4 functions are supplied:
	*  • addEventHandler(element, eventType, handler, useCapture [, userArg,………])  ←  this returns a UniDOM.EventHandler Object (see below)
	*  • removeEventHandler(element, eventType, handlerArray)    < ← these two return an Id code for the Object
	*  • getEventHandlerId(element, eventType, handlerArray)      \    window.UniDOM_EventHandlers[ID_code]
	*  • removeAllEventHandlers()    //this is automatically attached to every window that uses addEventHandler
	*
	* When adding handlers, event types may be passed in with or without the initial “on” and are case-insensitive.
	* When you add [an] event handler[s], it/they is/are “wrapped” with an internal function,
	*  and the wrapper is then the attached event handler.
	* You may add your handler[s] to a single event type, or an array of event types (“onMouseOver,” “onMouseOut,” etc.),
	*  using one single call to addEventHandler().
	* You may add a single event handler, or an array of event handlers (using one single call to addEventHandler())
	*  to be called in order by the wrapper function.
	* “addEventHandler” returns a “handler-Object” with properties corresponding to each event type registered,
	*  and each of these properties is a “UniDOM.EventHandler” Object.  Each handler-Object property name is the exact
	*  same as you pass in for the event type.  The UniDOM.EventHandler Objects hold vital info about your attached
	*  event handlers, and are interactive.

	* a UniDOM.EventHandler Object has the following porperties and method:
			id         unique id
			element
			eventType
			handler    an array of the handlers that are executed in order for each event
			handler.suspend   boolean value to temporarily suspend calling the handlers
			wrapper    the wrapper function that is actually added as an event handler to the element.
									You may invoke this wrapper directly to simulate an event
			userArgs   an array of user arguments; each passed as an argument to each handler function by the wrapper.
			remove()   this method removes the event handler wrapper from the element and sets the id to false;

	* You may alter the properties of a UniDOM.EventHandler Object, but replacing them is ineffective.
	*  For instance you may push, pop, shift, unshift or otheriwse alter the handler and userArgs arrays, and
	*  the wrapper function will call the functions in the modified handler-array, passing the arguments in the
	*  modified uaerArgs-array, though note that even if you remove all the handlers from
	*  the handler-Array, the “wrapper” will still be attached to the element and active.

	* The wrapper sends	to your handlers a hybrid EventObject which guarantees the following properties:
	*   event ={
				id:  unique id generated for each event;
				offsetX:    //calculated for standards-complient browsers __when applicable__
				offsetY:    //calculated for standards-complient browsers __when applicable__

				target:        MSIE_event.srcElement  →  the Element, Document, or Window that generated the event
											 i.e. a –possible– childNode of the “currentTarget” element to which this event handler is attached
				currentTarget: element  →  the current element during capture or bubble phases (value of “this” when an event-handler is attached to or is a property of an Element)
				relatedTarget: MSIE_event.fromElement || MSIE_event.toElement   →  the Element from which the mouse is going/coming
				eventPhase:    1,    ← ← ← when you employ the simulated capture phase
				eventPhase:    (MSIE_event.sourceElement===element) ? 2 : 3    ← ← ← where element is the one you attach the event to
				charCode:      MSIE_event.keycode

				stopPropagation: function()  {this.cancleBubble=true;}
				preventDefault:  function()  {this.returnValue=false;}

				MSIE:  true for Microsoft’s Internet Exploder, undefined otherwise.  }
	*
	* Once registered, a reference to the wrapper function is stored in the element’s window in a global property:
	*   window.UniDOM_EventHandlers[referenceId]
	* Each wrapper reference is assigned a unique id (found using getEventHandlerId) which is the referenceId noted above.

	* Each handler added using addEventHandler() may be a function or an Object with a method: handleEvent.
	* The value of “this” within the added function or Object method will be as follows:
							function  →  this  →  the Element to which the event handler was “added”
		Object.handleEvent  →  this  →  Object

	* For Microsoft’s Internet Exploder, the “capturing phase” of an event is simulated by triggering events from the
	*  document Object down the chain to the target Element before applying the user’s handlers.
	* This would cause each to normally bubble back up, causing an excess of event handler invocations.
	* So to use the “useCapture” feature properly with MSIE, each capturing handler should contain the following line:
			if (event.MSIE && event.eventPhase==1)  event.canbleBubble=true;
	* You should use  event.stopPropagation()  as usual, within any phase of the event.

	*/

	function arrayify(v)  {return  (v instanceof Array) ? v : [v];}

	var handlerCounter=0, eventCounter=0, addingHandler=false;

UniDOM.addEventHandler=function(element, eventType, handler, useCapture)  {
	eventType=arrayify(eventType);  handler=arrayify(handler);
	if (typeof useCapture !== Boolean)  useCapture=Boolean(useCapture);
	var i, k, userArgs=new Array, wrapper=new Array, EventType, added=new Object;
	if (arguments.length>4)  userArgs=Array.prototype.slice.call(arguments, 4);
	for (i=0; i<eventType.length;  i++)  {
		etype=eventType[i].toLowerCase().match( /^(?:on)?(.+)$/ )[1];
		if (UniDOM.getEventHandlerId(element, etype, handler) !== false)  return;

		if (document.addEventListener)  {
			wrapper[i]=function(event)  { var j, off, pass=[event];
				if (event.type.match( /click|mouse/ ))  {
					off=UniDOM.getMouseOffset(element, event);
					event.offsetX=off.x;
					event.offsetY=off.y;  }
				event.id=eventCounter++;
				for (j=0; j<userArgs.length;  j++)  {pass.push(userArgs[j]);}
				for (k=0; k<handler.length; k++)  {
					if (handler[k].handleEvent)  handler[k].handleEvent.apply(handler[k], pass);
					else  handler[k].apply(element, pass);  }  }
			element.addEventListener(etype, wrapper[i], useCapture);  }

		else
		if (document.attachEvent)  {
			wrapper[i]=function(event)  {
				if (!event)  event=window.event;
				var j, off, pass=[event];
				event.MSIE=true;
				event.id=eventCounter++;
				event.target=       event.srcElement;
				event.currentTarget=element;
				event.relatedTarget=event.fromElement || event.toElement;
				event.eventPhase=   (event.sourceElement===element) ? 2 : 3;
				event.charCode=     event.keycode;
				event.stopPropagation=function()  {this.cancleBubble=true;  this.cancleCapture=true;};
				event.preventDefault =function()  {this.returnValue=false;};
				for (j=0; j<userArgs.length;  j++)  {pass.push(userArgs[j]);}
				if (event.type.match( /click|mouse|resize|scroll/ )  &&  useCapture  &&  event.eventPhase==2)  {
					var h=new Array, p=event.target;
					do {h.unshift(p);}  while (p=parentNode.p);
					event.eventPhase=1;
					for (p=0; p<h.length; p++)  {
						h[p].fireEvent('on'+event.type, event);  //for this to work properly, your capturing event handler should always use:  if (event.MSIE && event.eventPhase==1)  event.canbleBubble=true;
						if (event.cancleCapture==true)  return event.returnValue;  }
					event.eventPhase=2;
					event.canbleBubble=false;  }
				for (k=0; k<handler.length; k++)  {
					if (handler[k].handleEvent)  handler[k].handleEvent.apply(handler[k], pass);
					else  handler[k].apply(element, pass);  }  }
			element.attachEvent('on'+etype, wrapper[i]);  }

		else throw new Error('Implementation can not add UniDOM Event Handler.');

		addingHandler=true;
		added[eventType[i]]=new UniDOM.EventHandler(element, etype, handler, useCapture, wrapper[i], userArgs);  }
	return added;  }



// We want to allow  (myObject instanceof UniDOM.EventHandler)
// but disallow false construction.
UniDOM.EventHandler=function(element, eventType, handler, useCapture, wrapper, userArgs)  {
	if (this==UniDOM)  throw new Error('UniDOM.EventHandler is a constructor, not a function');  // redundant because ↓
	if (!addingHandler)  throw new Error('UniDOM.EventHandler Objects may only be created using UniDOM.addEventHandler.');
	addingHandler=false;
	var d=element.ownerDocument  ||  element.document  ||  element;  // ← ElementNode || window || document
	var w=d.defaultView,
			id='h'+(handlerCounter++);

	if (!w.UniDOM_EventHandlers)  {
		w.UniDOM_EventHandlers=new Object;
		if (w.addEventListener)  w.addEventListener('unload', UniDOM.removeAllEventHandlers, false);
		else
		if (w.attachEvent)  w.attachEvent('onunload', UniDOM.removeAllEventHandlers);  }
	var ref={
		element:    element,
		eventType:  eventType,
		handler:    handler,
		wrapper:    wrapper,
		useCapture: useCapture }
	w.UniDOM_EventHandlers[id]=ref;
	if (!element.UniDOM_EventHandlers)  element.UniDOM_EventHandlers=new Object;
	element.UniDOM_EventHandlers[id]=ref;
	this.id=id;
	this.element=element;
	this.eventType=eventType;
	this.handler=handler;
	this.useCapture=useCapture;
	this.wrapper=wrapper;
	this.userArgs=userArgs;  }

UniDOM.EventHandler.prototype.remove=function()  {
	UniDOM.removeEventHandler(this);
	this.id=false;  }



UniDOM.removeEventHandler=function(element, eventType, handler, useCapture)  {
	var w, id, wrapper;
	if (arguments[0] instanceof UniDOM.EventHandler)  {
		id=arguments[0].id;
		eventType==arguments[0].eventType;
		wrapper=arguments[0].wrapper;
		useCapture=arguments[0].useCapture;
		element=arguments[0].element;  }
	else  {
		eventType=eventType.toLowerCase().match( /^(?:on)?(.+)$/ )[1];
		id=UniDOM.getEventHandlerId(element, eventType, handler);  }
	if (id===false)  return;
	w=(element.document  ||  element).parentWindow;
	if (element.removeEventListener)  element.removeEventListener(eventType, wrapper || w.UniDOM_EventHandlers[id].wrapper, useCapture);  // 'on'+
	else
	if (element.detachEvent)  element.detachEvent('on'+eventType, wrapper || w.UniDOM_EventHandlers[id].wrapper);
	delete element.UniDOM_EventHandlers[id];
	delete w.UniDOM_EventHandlers[id];  }


// if you don’t have access to the original UniDOM.EventHandler Object returned when adding event handlers,
// you can retrieve the unique Id for them using this.  If you registered an array of event handlers at once,
// the array you pass in must be in the same order as the array given when adding the handler; or if the array
// of event handlers was modified after adding them, the new current order.
UniDOM.getEventHandlerId=function(element, eventType, handler)  {
	if (!element.UniDOM_EventHandlers)  return false;
	eventType=eventType.toLowerCase().match( /^(?:on)?(.+)$/ )[1];
	handler=arrayify(handler);
	var id, h, i, j, flag,
			w=(element.ownerDocument  ||  element.document  ||  element).defaultView;
	for (id in element.UniDOM_EventHandlers)  {
		h=w.UniDOM_EventHandlers[id];
		if (h.eventType===eventType  &&  h.handler.length===handler.length)
			for (i=0, flag=true;  i<h.handler.length;  i++)  {
				if (h.handler[i]!==handler[i])  {flag=false;  break;}  }
			if (flag)  return id;  }
	return false;  }


// registered to a window or is a property of an element so “this” is the window or element…
UniDOM.removeAllEventHandlers=function(element)  { var id, h;
	if (this===UniDOM  &&  !element)  throw new Error('UniDOM.removeAllEventHandlers is a method of a DOM Element, or must be supplied an element as an argument.');
	if (!element)  element=this;
	if (typeof element.UniDOM_EventHandlers !== Object)  return;
	if (element.parentWindow)  {
		for (id in element.UniDOM_EventHandlers)  {
			h=element.UniDOM_EventHandlers[id];
			UniDOM.removeEventHandler(h.element, h.eventType, h.wrapper);
			delete element.parentWindow.UniDOM_EventHandlers[id];  }
		delete element.UniDOM_EventHandlers;  }
	else  {
		for (id in element.UniDOM_EventHandlers)  {
			h=element.UniDOM_EventHandlers[id];
			if (h instanceof Object)  {
				UniDOM.removeEventHandler(h.element, h.eventType, h.wrapper);
				delete element.UniDOM_EventHandlers[id];  }  }
		if (element===element.top)  {
				if (element.removeEventListener)  element.removeEventListener('unload', arguments.callee, false);  //on
				else
				if (element.detachEvent)  element.detachEvent('onunload', arguments.callee);  }
			}  }


UniDOM.generateEvent=function(element, eventType, eSpecs)  {  var i, p, eT, event;
	if (typeof eSpecs !== 'object')  eSpecs=new Object;
	if (!(eventType instanceof Array))  eventType=[eventType];
	for (i=0; i<eventType.length; i++)  {
		eT=eventType[i].toLowerCase().match( /^(?:on)?(.+)$/ )[1];
		if (document.createEvent)  {
			switch (eT.match( /mouse|click|key|./ )[0])  {
				case 'mouse':
				case 'click': event=document.createEvent('MouseEvent');  break;
				case 'key':   event=document.createEvent('UIEvent');  break;
				default:    event=document.createEvent('Event');  break;  }
			event.initEvent(eT, eSpecs.canBubble, eSpecs.cancelable,  // all Events
				eSpecs.view, eSpecs.detail,   // UIEvents (includes key events and mouse events)
				eSpecs.screenX, eSpecs.screenY, eSpecs.clientX, eSpecs.clientY, eSpecs.ctrlkey, eSpecs.altkey, eSpecs.shiftKey, eSpecs.metakey, eSpecs.button, eSpecs.relatedTarget  // MouseEvents
			);
			if (eSpecs.userArgs)  for (p in eSpecs.userArgs)  {event[p]=eSpecs.userArgs[p];}
			element.dispatchEvent(event);  }
		else  { //old MSIE
			event=document.createEventObject();  event.type=eT;
			if (eSpecs.userArgs)  for (p in eSpecs.userArgs)  {event[p]=eSpecs.userArgs[p];}
			element.fireEvent('on'+eT, event);  }  }  }


UniDOM.getMouseOffset=function(element, event)  {
	var offset=UniDOM.getElementOffset(element);
	offset.x=event.clientX-offset.x;
	offset.y=event.clientY-offset.y;
	return offset;  }


//  Returns the element offset from the window’s top-left corner
//  or if  scroll=false  from the document’s top-left corner
//  If the element is − or is nested within − a fixed-position element, it will be noted in the return object…
UniDOM.getElementOffset=function(element, scroll)  { var x=0, y=0;
	if (scroll===undefined)  scroll=true;
	while ((s=(getComputedStyle(element)  ||  element.currentStyle))  &&  element.offsetParent)  {
		if (s.position==='fixed')  scroll=false;
		x+=element.offsetLeft;  y+=element.offsetTop;
		element=element.parentNode;  }
	if (scroll)  {x-=UniDOM.getScrollX();  y-=UniDOM.getScrollY();}
	return {x:x, y:y, fixed:(s.position==='fixed')};  }


UniDOM.addEventHandler(window, 'onload', function()  {

//position of the browser window on the desktop:
if (window.screenLeft)  {
	UniDOM.getScreenY=function(w)  {return  (w  ||  window).screenLeft;};
	UniDOM.getScreenY=function(w)  {return  (w  ||  window).screenTop;};  }
else
if (window.screenX)  {
	UniDOM.getScreenX=function(w)  {return  (w  ||  window).screenX;};
	UniDOM.getScreenY=function(w)  {return  (w  ||  window).screenY;};  }


if (window.innerWidth)  {
	UniDOM.getInnerWidth=function(w)  {return  (w  ||  window).innerWidth;};
	UniDOM.getInnerHeight=function(w)  {return  (w  ||  window).innerHeight;};
	UniDOM.getScrollX=function(w)  {return  (w  ||  window).pageXOffset;};
	UniDOM.getScrollY=function(w)  {return  (w  ||  window).pageYOffset;};  }
else
if (document.documentElement  && document.documentElement.clientWidth)  {
	UniDOM.getInnerWidth=function(w)  {return  (w  ||  window).document.documentElement.clientWidth;};
	UniDOM.getInnerHeight=function(w)  {return  (w  ||  window).document.documentElement.clientHeight;};
	UniDOM.getScrollX=function(w)  {return  (w  ||  window).document.documentElement.scrollLeft;};
	UniDOM.getScrollY=function(w)  {return  (w  ||  window).document.documentElement.scrollTop;};  }
else
if (document.body.clientWidth)  {
	UniDOM.getInnerWidth=function(w)  {return  (w  ||  window).document.body.clientWidth;};
	UniDOM.getInnerHeight=function(w)  {return  (w  ||  window).document.body.clientHeight;};
	UniDOM.getScrollX=function(w)  {return  (w  ||  window).document.body.scrollLeft;};
	UniDOM.getScrollY=function(w)  {return  (w  ||  window).document.body.scrollTop;};  }
});


UniDOM.scrollbarWidth=function() {  // http://javascript.jstruebig.de/javascript/70
	var temp=document.body.style.overflow;

	// Scrollbalken im Body ausschalten
	document.body.style.overflow = 'hidden';
	var width = document.body.clientWidth;

	// Scrollbalken
	document.body.style.overflow = 'scroll';

	width -= document.body.clientWidth;

	// Der IE im Standardmode
	if(!width) width = document.body.offsetWidth-document.body.clientWidth;

	// ursprüngliche Einstellungen wiederherstellen
	document.body.style.overflow = temp;

	return width; };


UniDOM.getScrollBarWidth=function() {   // http://www.alexandre-gomes.com/?p=115
	var inner = document.createElement('p');
	inner.style.width = "100%";
	inner.style.height = "200px";

	var outer = document.createElement('div');
	outer.style.position = "absolute";
	outer.style.top = "0px";
	outer.style.left = "0px";
	outer.style.visibility = "hidden";
	outer.style.width = "200px";
	outer.style.height = "150px";
	outer.style.overflow = "hidden";
	outer.appendChild (inner);

	document.body.appendChild (outer);
	var w1 = inner.offsetWidth;
	outer.style.overflow = 'scroll';
	var w2 = inner.offsetWidth;
	if (w1 == w2) w2 = outer.clientWidth;

	document.body.removeChild (outer);

	return (w1 - w2);
};


	// note we subtract 10 for reasons I can’t explain:
UniDOM.getViewWidth=function(w)  { w=w || window;
	return UniDOM.getInnerWidth(w) - 10 - (
					 (parseInt(getComputedStyle(w.document.body).height) > UniDOM.getInnerHeight(w))  ?   //bug: if there is a scrollbar at the window bottom, there is a possible slight discrepency…
						 UniDOM.getScrollBarWidth()
					:  0 );  }




/* ========The second half======
 *
 *
 */

UniDOM.exploder=(navigator) ?  navigator.userAgent.match( /MSIE[ ]?([1-9][0-9]?)/i )  :  false;

UniDOM.isElementNode=(UniDOM.exploder  &&  parseInt(UniDOM.exploder[1]) < 9) ?
	function(e)  {return (typeof e == 'object'  &&  e.nodeType===Node.ELEMENT_NODE);}  //dumb-down the test for Microsoft to pass
: function(e)  {return (typeof e == 'object'  &&  (e instanceof Node)  &&  e.nodeType===Node.ELEMENT_NODE);};


// if deep=false  (this is the default value for deep)
//    returns a single HTML element
//    or
//    returns false if no matches found
// if deep=true
//    returns an array of HTML elements (though there may be zero array members)
	function getAncestor(cb, deep, objFlag)  {
		if (typeof cb !== 'function')  return;
		if (typeof deep === 'undefined')  deep=false;
		var e=(this instanceof Element) ? this : this.element;
		return (function(parent) { var found=new Array(), grandparent;
			if (cb(parent))  {
				if (!deep)  return parent;
				found.push(parent);  }
			if (parent.parentNode  &&  (grandparent=arguments.callee(parent.parentNode)))
				found=found.concat(grandparent);
			if (deep && objFlag)  objectify(found, objFlag);  //flag here is filter there
			return  deep ? found : ((found.length>0) ? found[0] : false);
			})(e.parentNode);  //here we execute the anonymous closure function
		}


// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
	function getElements(cb, deep, objFlag)  {
		if (typeof cb !== 'function')  return;
		if (typeof deep === 'undefined')  deep=true;
		var e=(this instanceof Element) ? this : this.element;
		return (function(kids) { var found=new Array(), grandkids, i;
			for (i=0; i<kids.length; i++)  {
				if (cb(kids[i]))  found.push(kids[i]);
				if (deep  &&  kids[i].hasChildNodes()  &&  (grandkids=arguments.callee(kids[i].childNodes)))
					found=found.concat(grandkids);  }
			if (objFlag)  objectify(found, objFlag);  //flag here is filter there
			return found;
		})(e.childNodes);  }  //here we execute the anonymous closure function and thus return its value

	//private
	function objectify(a, filter)  { var n, i;
		for (i=0; i<a.length; i++)  {
			n=filter(a[i]);
			if (a[n]  &&  !(a[n] instanceof Array))  a[n]=[a[n]];
			if (a[n] instanceof Array)  a[n].push(a[i]);  else  a[n]=a[i];  }  };


// returns an array of HTML elements (though there may only be one array member)
// returns false if no matches found
	function getElementsByName(c, deep, objFlag)  {
		if (c===""  ||  typeof c === 'undefined'  ||  c===null)  c=new RegExp('^.+$');
		else
		if (typeof c !== 'object'  ||  !(c instanceof RegExp))  c=new RegExp('^'+c+'$');
		var found=getElements.call(this, function(e) {return typeof e.name == 'string'  &&  e.name.match(c)}, deep, objFlag);
//alert(this+'\n'+deep+'\n'+objFlag+'\n'+c+'\n'+found.length);
		return found.length ? found : false;  };

// returns an array of HTML elements (though there may only be one array member)
// returns an empty array if no matches found
	function getElementsByClassName(c, deep, objFlag)  {
		if (typeof c !== 'object'  ||  !(c instanceof RegExp))  c=new RegExp('\\b'+c+'\\b');
		return getElements.call(this,
			function(e) {return typeof e.className == 'string'  &&  e.className.match(c)},
			deep, objFlag );  }

//  getElementsByClassName() and getAncestorByClassName() each work a little different depending on the value of  deep
//  if  deep=true  then an array of all elements found to match (children or ansestors) will be returned.
//  with getElements(), if  deep=false  then only immediate children will be considered.
//  with getAncestor(), if  deep=false  then only the closest matching ansestor will be returned (if any).

// returns a single HTML element if deep=false  (this is the default value for deep)
// returns an array of HTML elements (though there may only be one array member) if deep=true
// returns false if no matches found
	function getAncestorByClassName(c, deep, objFlag)  {
		if (typeof c !== 'object'  ||  !(c instanceof RegExp))  c=new RegExp('\\b'+c+'\\b', 'i');
		return getAncestor.call(this,
			function(p) {return (typeof p.className == 'string'  &&  p.className.match(c))},
			deep, objFlag )  }

// returns (e) if the element (e) is an ancestor of the Element.
// else returns false.
	function hasAncestor(e)  {return this.getAncestor(function(a)  {return (a===e)})}



	function addClassName(c)  {  // c must be the string name of the class  or an array of these strings
		var i, old=this.className;
		if (!(c instanceof Array))  c=[c];
		for (i=0; i<c.length; i++)  {
			if (!(typeof this.className == 'string'  &&  this.className.match( new RegExp('\\b'+c[i]+'\\b') )))
				this.className+=(this.className) ? (" "+c[i]) : c[i];
			}
//		document.getElementById('tester1').firstChild.data+=('added:  “'+ c +'”  to:  “'+ old +'”  to get:  “'+  this.className + '”\n');
				}

//  addClassName() will not add the CSS class name if it already exists as such.
//  removeClassName() will remove all copies of the CSS class name,
//    and also stray & multiple spaces between CSS class names, found in Elment.className.
//  both allow and respect an Element.className to contain multiple CSS class names.

	function removeClassName(c) {this.className=xClassName.call(this, c);}
	function xClassName(c) {   // c may be the string name of the class or a RegExp  or an array of these
		if (typeof this.className != 'string')  return;
		var i, old=this.className  , cs=c;
		if (!(c instanceof Array))  c=[c];
		else  c=c.slice(0);  // we may modify these values, and don't want to muck up the caller’s array.
		for (i=0; i<c.length; i++)  {
			if (typeof c[i] !== 'object'  ||  !(c[i] instanceof RegExp))  c[i]=new RegExp('\\b'+c[i]+'\\b', 'g');
			var cn=this.className;
			cn=cn.replace(c[i], "");
			cn=cn.replace( /^\s*/ , "");
			cn=cn.replace( /\s*$/ , "");
			cn=cn.replace( /\s{2,}/ , " ");  }
//		document.getElementById('tester1').firstChild.data+=('removed:  “'+ cs +'”  from:  “'+ old +'”  to get:  “'+  cn +"”\n");
		return cn;  }

	function useClassName(c, b)  {  // c should be the string name of the class
		var e=(this instanceof Element) ? this : this.element;
		if (b)  addClassName.call(e, c);
		else  removeClassName.call(e, c);  }

	function exchangeClassNames(oc, nc)  {  // oc=old class   nc=new class
		var cn=xClassName.call(this, oc);
		if (!(typeof cn == 'string'  &&  cn.match( new RegExp('\\b'+nc+'\\b') )))  {
			this.className=(cn) ? (cn+" "+nc) : nc;
//			document.getElementById('tester1').firstChild.data+=('added:  “'+ nc +'”  to:  “'+ cn +'”  to get:  “'+  this.className + '”\n');
			}  }

UniDOM.getAncestor=function(element)  {return getAncestor.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.getElements=function(element)  {return getElements.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.getElementsByName=function(element)  {return getElementsByName.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.getElementsByClassName=function(element)  {return getElementsByClassName.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.getAncestorByClassName=function(element)  {return getAncestorByClassName.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.hasAncestor=function(element)  {return hasAncestor.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.addClassName=function(element)  {return addClassName.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.removeClassName=function(element)  {return removeClassName.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.useClassName=function(element)  {return useClassName.apply(element, Array.prototype.slice.call(arguments, 1));};
UniDOM.exchangeClassNames=function(element)  {return exchangeClassNames.apply(element, Array.prototype.slice.call(arguments, 1));};


UniDOM.ELementWrapper=function(element)  {this.element=element;};
UniDOM.ELementWrapper.prototype.getAncestor=function()  {return UniDOM(getAncestor.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.getElements=function()  {return UniDOM(getElements.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.getElementsByName=function()  {return UniDOM(getElementsByName.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.getElementsByClassName=function()  {return UniDOM(getElementsByClassName.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.getAncestorByClassName=function()  {return UniDOM(getAncestorByClassName.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.hasAncestor=function()  {return UniDOM(hasAncestor.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.addClassName=function()  {return UniDOM(addClassName.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.removeClassName=function()  {return UniDOM(removeClassName.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.useClassName=function()  {return UniDOM(useClassName.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.exchangeClassNames=function()  {return UniDOM(exchangeClassNames.apply(this.element, arguments));};
UniDOM.ELementWrapper.prototype.addEventHandler=function(eventType, handler)  {UniDOM.addEventHandler(this.element, eventType, handler);}
UniDOM.ELementWrapper.prototype.removeEventHandler=function(eventType, handler)  {UniDOM.removeEventHandler(this.element, eventType, handler);}
UniDOM.ELementWrapper.prototype.generateEvent=function(eventType)  {UniDOM.generateEvent(this.element, eventType);}
if (typeof Element.prototype.dispachEvent !== 'function')
UniDOM.ELementWrapper.prototype.dispachEvent=function(event)  {
		this.element.fireEvent('on'+event.type.toLowerCase().match( /^(?:on)?(.+)$/ )[1], event);  }
else
UniDOM.ELementWrapper.prototype.dispachEvent=function(event)  {
		this.element.dispatchEvent(event.type.toLowerCase().match( /^(?:on)?(.+)$/ )[1], event);  };

UniDOM.ELementWrapper.prototype.getOffset=function(scroll)  {return UniDOM.getElementOffset(this.element, scroll);}
UniDOM.ELementWrapper.prototype.getMouseOffset=function(event)  {return UniDOM.getMouseOffset(this.element, event);}




UniDOM.prototypify=function()  {

if (typeof Element.getAncestor !== 'function')
	Element.prototype.getAncestor=getAncestor;
if (typeof Element.getElements !== 'function')
	Element.prototype.getElements=getElements;
if (typeof Element.getElementsByName !== 'function')
	Element.prototype.getElementsByName=getElementsByName;
if (typeof Element.getElementsByClassName !== 'function')
	Element.prototype.getElementsByClassName=getElementsByClassName;
if (typeof Element.getAncestorByClassName !== 'function')
	Element.prototype.getAncestorByClassName=getAncestorByClassName;
if (typeof Element.hasAncestor !== 'function')
	Element.prototype.hasAncestor=hasAncestor;
if (typeof Element.addClassName !== 'function')
	Element.prototype.addClassName=addClassName;
if (typeof Element.exchangeClassNames !== 'function')
	Element.prototype.exchangeClassNames=exchangeClassNames;
if (typeof Element.removeClassName !== 'function')
	Element.prototype.removeClassName=removeClassName;
if (typeof Element.useClassName !== 'function')
	Element.prototype.useClassName=useClassName;

	Element.prototype.addUniDOMEventHandler=function(eventType, handler, useCapture)  {
		var args=Array.prototype.slice.call(arguments, 0);
		args.unshift(this);
		UniDOM.addEventHandler.apply(UniDOM, args);  }
	Element.prototype.removeUniDOMEventHandler=function(eventType, handler, useCapture)  {
		UniDOM.removeEventHandler(this, eventType, handler, useCapture);  }

	Element.prototype.generateUniDOMEvent=function(eventType)  {UniDOM.generateEvent(this, eventType);}

if (typeof Element.dispachEvent !== 'function') //checking prototype doesn't work…
	Element.prototype.dispachEvent=function(event)  {
		this.fireEvent('on'+event.type.toLowerCase().match( /^(?:on)?(.+)$/ )[1], event);  }

	Element.prototype.getOffset=function(scroll)  {return UniDOM.getElementOffset(this, scroll);}
	Element.prototype.getMouseOffset=function(event)  {return UniDOM.getMouseOffset(this, event);}  }

})();

}  // close  with(SoftMoon.WebWare)
