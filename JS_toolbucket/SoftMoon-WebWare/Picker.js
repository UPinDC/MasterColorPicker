// Picker.js Beta-2.1 release 1.1  3-23-2013  by SoftMoon-WebWare.
/*   written by and Copyright © 2011, 2012, 2013 Joe Golembieski, SoftMoon-WebWare

  	This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.
		The original copyright information must remain intact.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with this program.  If not, see <http://www.gnu.org/licenses/>   */

//  character encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 120

// requires  SoftMoon-WebWare’s UniDOM package:
// “UniDOM” may be global or a property of “SoftMoon.WebWare”

if (typeof SoftMoon !== 'object')  SoftMoon=new Object;
if (typeof SoftMoon.WebWare !== 'object')   SoftMoon.WebWare=new Object;

								 // ¡!YO!¡ \\
								//  ↓    ↓  \\
//  ********  be SURE to READ the comments on applied classnames just below the Picker constructor function  **********


//********* Picker constructor ************\\
// the “mainPanel” should •be 1 or •wrap 1 or more
//    “picker” DOM Elements→ className = PickerInstance.classNames.picker,
//    each Element being a separate picker (note also the picker_select option below).
// “opts.picker_select” optional - should be a <select> tag or an Array of <input type='checkbox|radio' />
//    to choose which picker is “active” (using PickerInstance.classNames.activePicker);
//    or null may be passed in and all pickers will be considered “active” when the picker-interface is active.
// “opts.pickFilter” optional - may be a function or Array of functions to supplement (or replace by returning false)
//    the standard “PickerInstance.pick” function.
// “opts.masterDataTarget” optional - may be a DOM Element which will *always* receive the value picked
//    by the Picker, unless picker is activated using  PickerInstance.setActivePickerState(true, dataTarget)
//    and when this dataTarget relinquishes focus, the picker reverts back to using the “masterDataTarget”
// “opts.classNames” optional - may be an Object with properties to replace the implementation level of
//    the standard-default SoftMoon.WebWare.Picker.classNames
SoftMoon.WebWare.Picker=function(mainPanel, opts)  { with (SoftMoon.WebWare)  {
	if (!UniDOM.isElementNode(mainPanel))  throw new Error("Picker mainPanel must be a DOM Element Node");

	var p, i, PickerInstance=this;

	UniDOM.addEventHandler(mainPanel, 'onclick', function() {
		if (PickerInstance.pickerActiveFlag)  PickerInstance.dataTarget.focus();
		PickerInstance.setTopPanel(mainPanel);
		return true;  } );
	UniDOM.addEventHandler(mainPanel, 'onmouseover', function() {PickerInstance.mouseOverPickerPanel=true;});
	UniDOM.addEventHandler(mainPanel, 'onmouseout', function() {PickerInstance.mouseOverPickerPanel=false;});

	this.mainPanel=mainPanel;
	this.panels=[mainPanel];
	this.mouseOverPickerPanel=false;
	this.mouseOverPanelBody=false;
	this.mouseOverInterfaceElement=false;
	this.masterTarget=null;
	this.registeredTargets=new Array;
	this.pickFilters=new Array;
	this.classNames=new Object;
	for (p in Picker.classNames)  {this.classNames[p]=Picker.classNames[p];};

	// the following two properties are meant to be attached to an <input>, <textarea> etc. as an event handler.
	this.onFocus=function() {PickerInstance.setActivePickerState(true, this);};  //← “this”  then refers to the <input> etc.
	this.onBlur=function() {PickerInstance.setActivePickerState(false, this);};  //← “this”  then refers to the <input> etc.

	if (typeof opts == 'object')  {
		if (opts.picker_select)  {
			if ((UniDOM.isElementNode(opts.picker_select)  &&  opts.picker_select.nodeName=='SELECT')
			||  (opts.picker_select instanceof Array
					&&  (function(a)  {
						for (var i=0; i<a.length; i++)  {if (!UniDOM.isElementNode(a[i]) || a[i].nodeName!='INPUT' || (a[i].type!='checkbox' && a[i].type!='radio')) return false;};  return true;  }
						)(opts.picker_select)))  {
				this.picker_select=opts.picker_select;
				if (opts.picker_select.nodeName=='SELECT')  { for (p=0; p<opts.picker_select.options.length;  p++)  {
					if (typeof opts.picker_select.options[p].value === 'undefined')
						opts.picker_select.options[p].value=opts.picker_select.options[p].text;  }  }  }
			else  throw new Error("picker_select must be a DOM &lt;select&gt; Element Node or an Array of DOM &lt;input type='checkbox|radio' /&gt; Element Nodes");  }

		if (!(opts.pickFilters instanceof Array))  opts.pickFilters=[opts.pickFilters];
		for (i=0; i<opts.pickFilters.length; i++)  {
			if (typeof opts.pickFilters[i] == 'function')  this.pickFilters.push(opts.pickFilters[i]);
			else if (opts.pickFilters[i])  throw new Error("Picker “opts.pickFilters["+i+"]” must be a function");  }

		if (opts.masterDataTarget)  {
			this.dataTarget=opts.masterDataTarget;
			this.masterTarget=opts.masterDataTarget;  }

		if (opts.classNames)  { var c=0, errTxt="Picker “classNames” Object is invalid.";
			if (typeof opts.classNames != 'object')  throw new Error(errTxt);
			for (p in Picker.classNames)  { if (typeof opts.classNames.p != 'undefined')  {
				if (typeof opts.classNames[p] != 'string')  throw new Error(errTxt);
				else  this.classNames[p]=opts.classNames[p];  }  }  }  }

	UniDOM.addClassName(mainPanel, [this.classNames.pickerPanel, this.classNames.panelLevel+'1']);
	var panelBody=this.mainPanel.childNodes;
	if (panelBody)  for (i=0; i<panelBody.length; i++)  { if (panelBody[i].nodeType===Node.ELEMENT_NODE)  {
		UniDOM.addEventHandler(panelBody[i], 'onmouseover', function() {PickerInstance.mouseOverPanelBody=true;});
		UniDOM.addEventHandler(panelBody[i], 'onmouseout', function() {PickerInstance.mouseOverPanelBody=false;});  }  }  }  };




								 // ¡!YO!¡ \\
								//  ↓    ↓  \\
//these are default class names.  Changing them changes the values for all future Pickers created.
//Pass in opts.classNames when creating a Picker for instance-based class names; or modify  yourInstance.classNames

//Content within a pickerPanel including the Pickers themselves should not use scroll-bars;
//  the mainPanel or other panels should scroll if necessary.
//This is required to keep focus on the targetElement when the scroll-bars are clicked-on without blocking a click on the Picker.
SoftMoon.WebWare.Picker.classNames={
	picker: 'picker',                          // ← the classname that needs to be applied to all pickers in the mainPanel
	pickerPanel: 'pickerPanel',                // ← applied to the mainPanel and any other registered panels
	selectedPicker: 'selectedPicker',          // ← applied to a picker when it is selected
	activePicker: 'activePicker',              // ← applied to:  ((active means the dataTarget input has focus))
																						 //   • a picker when it is selected and active
																						 //   • all panels when a picker is active
	activePickerInterface: 'activePickerInterface',  // ← applied to:
																						 //   • the selected picker(s) when any interfaceElement has focus
																						 //     (an interfaceElement is an element in your picker
																						 //      or one of the panels, that the user modifies and therefore requires
																						 //      “focus” — <input type='(most but not all)' /> <textarea> <select> —
																						 //      to adjust the picker itself and/or it’s chooses;
																						 //      see “registerInterfacePanel” below)
	activeInterface: 'activeInterface',        // ← applied to:
																						 //   • all panels when any one of the interfaceElements has focus
	activePanel: 'activePickerPanel',          // ← applied to a panel when
																						 //   • it is the top panel and the dataTarget has focus (is active)
																						 //   • it is the top panel and one of it’s interfaceElements has focus
	panelLevel: 'pickerPanelZLevel' };    // ← panelZLevel will be post-fixed with a digital level (1 – ∞, 1 at the bottom)
			// representing a CSS z-index level (like this:  div.pickerPanelZLevel1 {z-index: 1}   ← of course use your own z-index values as needed……and any element, not only <div>
			//																							 div.pickerPanelZLevel2 {z-index: 2}   etc… … …)
			// **when you have more than one panel (mainPanel + others)** clicking on a panel brings it to the top level.
			// These ZLevel classnames are applied automatically when you:
			//   • pass in a mainPanel as you create a new PickerInstance
			//   • register a panel (see: SoftMoon.WebWare.Picker.prototype.registerInterfacePanel)
			// The mainPanel is at the top, and the sub-panels are arranged last-registered at the bottom.




SoftMoon.WebWare.Picker.prototype.setTopPanel=function(panel)  {
	if (panel)  this.panels.sort(function(a, b)  {
		if (a===panel)  return 1;
		if (b===panel)  return -1;
		else return 0;  });
	var i, rc=RegExp('\\b(' + this.classNames.panelLevel + '[0-9]+|' + this.classNames.activePanel + ')\\b', 'g');
	for (i=0; i<this.panels.length; i++)  { with (SoftMoon.WebWare)  {
		UniDOM.exchangeClassNames(this.panels[i], rc, this.classNames.panelLevel+String(i+1));
		if (i===this.panels.length-1
		&&  (this.pickerActiveFlag  ||  this.interfaceActiveFlag))
			UniDOM.addClassName(this.panels[i], this.classNames.activePanel);  }  }  }



// MSIE9 (and most likely previous versions) fail to trigger an onblur event for the target element under certain
//  circumstances when you click on a scroll-bar within the picker.
SoftMoon.WebWare.Picker.prototype.setActivePickerState=function(flag, target)  {
// when flag=true, target is:
//                     • an object with a “focus()” method and a “value” property which becomes the “dataTarget”
//                     • a flag=false → use the current “dataTarget”
// when flag=false, target is a flag → true=“revert to masterTarget”  false=“retain dataTarget”

	if (this.mouseOverPickerPanel  &&  !flag)  {  //catch a click on a picker scroll-bar
		if (!this.mouseOverInterfaceElement  &&  !this.mouseOverPanelBody)  { var thisTarget=this.dataTarget;
			setTimeout(function() {thisTarget.focus();}, 0);  }  //help Google’s Chrome to keep track of what’s going on by setting a timeout (it has a hard time remembering to make the cursor blink)
		return;  }
	if (this.mouseOverInterfaceElement  &&  !flag)  return;  //for interfaceElements that are not on a panel

	this.pickerActiveFlag=flag;
	if (target)  this.dataTarget=(flag) ? target : this.masterTarget;
	if (flag  &&  this.dataTarget.PickerContainer)  this.dataTarget.PickerContainer.appendChild(this.mainPanel);
	this.choosePicker(this.classNames.activePicker, null, flag);
	this.setTopPanel();
	for (var i=0, PickerInstance=this;  i<this.panels.length;  i++)  { with (SoftMoon.WebWare)  {
		UniDOM.useClassName(this.panels[i], this.classNames.activePicker, flag);
		UniDOM.generateEvent(this.panels[i], 'onPickerStateChange',
			{canBubble: false,  userArgs: {flag: flag,  Picker: PickerInstance,  currentDataTarget: target}});  }  }
	if (this.onPickerStateChange)  this.onPickerStateChange(flag, target);  }



SoftMoon.WebWare.Picker.prototype.setActiveInterfaceState=function(flag, target)  { with (SoftMoon.WebWare)  {
	this.interfaceActiveFlag=flag;
	this.choosePicker(this.classNames.activePickerInterface, null, flag);
	if (target)  this.dataTarget=target;
	for (var i=0, PickerInstance=this;  i<this.panels.length;  i++)  {
		UniDOM.useClassName(this.panels[i], this.classNames.activeInterface, flag);
		UniDOM.generateEvent(this.panels[i], 'onInterfaceStateChange',
			{canBubble: false,  userArgs: {flag: flag,  Picker: PickerInstance,  currentDataTarget: target}});	}
	if (this.onInterfaceStateChange)  this.onInterfaceStateChange(flag, target);  }  }



SoftMoon.WebWare.Picker.prototype.choosePicker=function(activeClassNames, pickerName, flag)  { with (SoftMoon.WebWare)  {
	var i, j, chosen, temp, pickers=new Array;
	for (i=0; i<this.panels.length; i++)  {
		if (temp=UniDOM.getElementsByClassName(this.panels[i], this.classNames.picker))  pickers=pickers.concat(temp);  }
	if (pickers.length)  {
		if (activeClassNames===undefined)  activeClassNames=[this.classNames.activePicker];
		else if (!(activeClassNames instanceof Array))  activeClassNames=[activeClassNames];
		if (typeof flag !== 'boolean')  flag=true;
		if (typeof pickerName == 'string')  pickerName=[{checked: true, value: pickerName}];
		else if (!(typeof pickerName === 'object'  &&  (pickerName instanceof Array)))  {
			try {
			pickerName=this.picker_select.options  ||  this.picker_select;  }
			catch(e) {}  }
	  for (i=0; i<pickers.length; i++)  {
			chosen=(pickers[i].id==='');
			for (j=0;  (!chosen)  &&  j<pickerName.length;  j++)  {
				if ((pickerName[j].selected  ||  pickerName[j].checked)  &&  pickers[i].id===pickerName[j].value.replace( /\s/g , ""))
					chosen=true;  }
			UniDOM.useClassName(pickers[i], this.classNames.selectedPicker, chosen);
			chosen=flag && chosen;
			for (j=0;  j<activeClassNames.length;  j++)  {
				UniDOM.useClassName(pickers[i], activeClassNames[j], chosen);  }
			UniDOM.generateEvent(pickers[i], 'onPickerStateChange', {canBubble: false, userArgs: {flag: chosen, classes: activeClassNames}});  }  }  }  }



SoftMoon.WebWare.Picker.prototype.pick=function(chosen)  {
	chosen=this.applyFilters.apply(this, arguments);
	if (chosen===false)  return;
	switch (this.dataTarget.nodeName)  {
		case '#text':     this.dataTarget.data=chosen;
		break;
		case 'SELECT':    this.dataTarget.options[this.selctionTarget.options.length]=chosen;
											this.dataTarget.selectedIndex=this.dataTarget.options.length-1;
		break;
		case 'TEXTAREA':  this.dataTarget.value+=chosen;
		break;
		case 'INPUT':     var dl=document.getElementById(this.dataTarget.list);
											if (dl)  dl.options[dl.options.length]=chosen;
		default:          this.dataTarget.value=chosen;  }
	try {this.dataTarget.focus();}
	catch(err) {};  }



SoftMoon.WebWare.Picker.prototype.applyFilters=function(chosen)  {
	// note how “chosen” is a ☆reference☆ to the first member of “arguments” (a special type of array!)
	//  so changing “chosen” modifies “arguments[0]” and visa-versa.
	for (var i=0; i<this.pickFilters.length;  i++)  {chosen=this.pickFilters[i].apply(this, arguments);}
	return chosen;  }



//You may use this quick utility to register standard event handlers that activate the picker
// when the given <input> element is active (has focus)
SoftMoon.WebWare.Picker.prototype.registerTargetElement=function(element, PickerContainer)  { with (SoftMoon.WebWare) {
	UniDOM.addEventHandler(element, 'onfocus', this.onFocus);
	UniDOM.addEventHandler(element, 'onblur', this.onBlur);
	element.PickerContainer=UniDOM.isElementNode(PickerContainer) ? PickerContainer : false;
	this.registeredTargets.push(element);  }  }



/* If you want to use an input or select that requires “focus” as an interface control for your picker (i.e., your
		picker may be dynamic, and the user may control this dynamicy using HTML form elements either integrated into
		the picker HTML itself or elsewhere in the document), this will take focus away from the target input (or whatever you use).
		Without registering your interface control, the Picker Class will loose track of whether to show the picker, etc.
	 So for every <input /> (type = text, number, file, etc: any that requires or accepts keyboard input)
		and every <textbox> and <select> that is an interface control for your picker, use the method below.
	 Checkboxes, radio buttons, <input type='range' /> etc. do not require focus, and do not need to be registered.

	The “actions” object passed in is optional, and may contain the following relevant functions / flag:

	enterKeyed:  «function» enhance the default action of the enter key, or prevent the default Picker action by returning true.
	tabbedOut:   «function» enhance the default action of the tab key, or prevent the default Picker action by returning true.
	tabToTarget: «boolean» tab key returns focus to the target (input) element, instead of the default of passing focus
								to the “next” focusable form element.
								This may be overridden or replaced using an HTML attribute “tabToTarget” in the interface-control element
								with values of 'true' or 'false'.
	onchange:    «function» enhance the default action of the Picker onchange method, or prevent the default Picker action by returning true.
 */
SoftMoon.WebWare.Picker.prototype.registerInterfaceElement=function(element, actions)  { with (SoftMoon.WebWare)  {  // UniDOM may be global or a property of SoftMoon.WebWare
		var tabbedOut, enterKeyed, selectPan, tabToTarget, PickerInstance=this;
		UniDOM.addEventHandler(element, 'onMouseOver', function(event) {PickerInstance.mouseOverInterfaceElement=true;});
		UniDOM.addEventHandler(element, 'onMouseOut', function(event) {PickerInstance.mouseOverInterfaceElement=false;});
		UniDOM.addEventHandler(element, 'onclick', function(event) {
			tabbedOut= enterKeyed= selectPan= tabToTarget= false;
			PickerInstance.setTopPanel(UniDOM.getAncestorByClassName(this, PickerInstance.classNames.pickerPanel));
			event.stopPropagation();  } );  //clicking on the picker-mainPanel normally causes PickerInstance.dataTarget.focus();
		UniDOM.addEventHandler(element, 'onfocus', function(event)  {
			PickerInstance.setActiveInterfaceState(true);
			tabbedOut= enterKeyed= selectPan= tabToTarget= false;  } );
		UniDOM.addEventHandler(element, 'onkeydown', function(event)  { //note Chrome does not trigger key events for <select> elements
			tabbedOut=(event.keyCode==9);
			enterKeyed=(event.keyCode==13);          //            == ↑                 == ↓
			selectPan=(this.nodeName==='SELECT'  &&  (event.keyCode==38 || event.keyCode==40));
			tabToTarget=false;
			if (tabbedOut)  {
				if (actions && actions.tabbedOut && actions.tabbedOut(event))  return;
				if ((actions  &&  actions.tabToTarget  &&  this.getAttribute('tabToTarget')!=='false')
				||  (this.getAttribute('tabToTarget')==='true'))  {
					tabToTarget=true;
					event.preventDefault();
					//note below we want to allow other user-added event-handlers to be executed as well…
					UniDOM.generateEvent(this, ['onchange', 'onblur']);  }  }
			if (enterKeyed)  {
				if (actions && actions.enterKeyed && actions.enterKeyed(event))  return;
				if (this.nodeName!=='SELECT')  {
					event.preventDefault();
					//note below we want to allow other user-added event-handlers to be executed as well…
					UniDOM.generateEvent(this, 'onchange');
					enterKeyed=false;
					this.focus();  }  }  } );
		UniDOM.addEventHandler(element, 'onchange', function(event)  {
			if (actions && actions.onchange && actions.onchange(event, enterKeyed, tabbedOut, selectPan))  return;
			if (!enterKeyed  &&  !selectPan  &&  PickerInstance.pickerActiveFlag)  {
				PickerInstance.setActiveInterfaceState(false);
				if (!tabbedOut  ||  tabToTarget)  PickerInstance.dataTarget.focus();  }  } );
		UniDOM.addEventHandler(element, 'onblur', function(event) {
			if (enterKeyed)  {enterKeyed=false;  this.focus;  return;}
			PickerInstance.setActiveInterfaceState(false);
			if (PickerInstance.mouseOverPickerPanel || tabbedOut)  {
				if (PickerInstance.pickerActiveFlag  &&  (!tabbedOut  ||  tabToTarget))  PickerInstance.dataTarget.focus();  }
			else  PickerInstance.setActivePickerState(false);  } );  }  }




SoftMoon.WebWare.Picker.prototype.registerInterfacePanel=function(panel, actions)  { with (SoftMoon.WebWare)  {  // UniDOM may be global or a property of SoftMoon.WebWare

	UniDOM.addClassName(panel, this.classNames.pickerPanel);
	this.panels.unshift(panel);
	this.setTopPanel();
	var PickerInstance=this;
	UniDOM.addEventHandler(panel, 'onclick', function() {
		if (PickerInstance.pickerActiveFlag)  PickerInstance.dataTarget.focus();
		PickerInstance.setTopPanel(panel);
		return true;  });
	UniDOM.addEventHandler(panel, 'onmouseover', function() {PickerInstance.mouseOverPickerPanel=true;});
	UniDOM.addEventHandler(panel, 'onmouseout', function() {PickerInstance.mouseOverPickerPanel=false;});
	var panelBody=panel.childNodes;
	if (panelBody)  for (i=0; i<panelBody.length; i++)  { if (panelBody[i].nodeType===Node.ELEMENT_NODE)  {
		UniDOM.addEventHandler(panelBody[i], 'onmouseover', function() {PickerInstance.mouseOverPanelBody=true;});
		UniDOM.addEventHandler(panelBody[i], 'onmouseout', function() {PickerInstance.mouseOverPanelBody=false;});  }  }

	var i, registered,
			inpTypes=[
		'text', 'search', 'tel', 'url', 'email', 'password', 'datetime', 'date',
		'month', 'week', 'time', 'datetime-local', 'number', 'color', 'file' ];

	function isCorrectInputType(elmnt)  { var j;
		for (j=0; j<inpTypes.length; j++)  {if (elmnt.type===inpTypes[j])  return true;}
		return false;  }

	//Traverse the children of “panel” looking for elements that need registering, and collect them into an array-object.
	//This array is ordered by the order the elements are found in the document.
	//In addition, the array-object has property names corresponding to the name-attributes of the elements, where
	// each property references the element.  If more than one element has the same name, the corresponding property
	// of the array-object is an simple array of these elements.
	registered=UniDOM.getElements( panel,
		function(elmnt)  {
			if (elmnt.nodeName=='SELECT' ||  elmnt.nodeName=='TEXTAREA'
			||  (elmnt.nodeName=='INPUT'  &&  isCorrectInputType(elmnt)))  return  true;  },
		true,  //check the children of children…
		function(elmnt)  {return elmnt.name;} );

	if (registered)  for (i=0; i<registered.length; i++)  {  //we could have registered each element AS WE FOUND IT using getElements (above), but then we can't set the tabToTarget properly…
		actns=(actions && actions[elmnt.name]) || {};
		actns.tabToTarget=actns.tabToTarget || (i===registered.length-1);
		this.registerInterfaceElement(registered[i], actns);  }

	return registered;  }  }
