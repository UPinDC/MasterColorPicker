// MasterColorPicker.js  ~release ~1.0.2  April-9-2013  by SoftMoon Webware.
/*   written by and Copyright © 2011, 2012, 2013 Joe Golembieski, SoftMoon WebWare

		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version, with the following additional requirements
		ADDED BY THE ORIGINAL SOFTWARE CREATOR AND LICENSOR that supercede any possible GNU licence definitions:
		This original copyright information must remain intact.
		The phrase “MasterColorPicker™ by SoftMoon-WebWare” must be visually presented to the end-user
			in a commonly readable font at 8pt or greater when this software is actively in use
			and when this software is integrated into any:
			• publicly available display (for example, an internet web-page),
			• software package (for example, another open-source project, whether free or distributed for-profit),
			• internally used software packages and/or displays within a business extablishment’s operational framework
				(for examples, an intranet system, or a propriatary software package used exclusively by employees).

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with this program.  If not, see <http://www.gnu.org/licenses/>   */

//  character-encoding: UTF-8 UNIX   tab-spacing: 2   word-wrap: no   standard-line-length: 120


// requires  SoftMoon.WebWare.rgb
// requires  SoftMoon.WebWare’s UniDOM package
// subject to move to unique files (with more functions) in the future:
//  • Math.Trig  (along with the defined “constants” under the  _  variable)
//  • SoftMoon.WebWare.canvas_graphics

//  JavaScript needs (1) constants, and (2) true UTF8 support for variable names…
if (typeof _ !== 'object')  _=new Array();  // can't think of why this should be an array, but why limit ourselves in the future?
_['12°']=Math.PI/30;
_['24°']=Math.PI/15;
_['30°']=Math.PI/6;
_['60°']=Math.PI/3;
_['90°']=Math.PI/2;
_['360°']=Math.PI*2;
_['Π×2']=Math.PI*2;
_['Π']  =Math.PI;
_['Π÷2']=Math.PI/2;
_['Π×3÷2']=Math.PI*3/2;
_['1÷3']=1/3;

Math.Trig={};

Math.Trig.getAngle=function(x, y, hwRatio)  { var angle;
	if (typeof hwRatio !== 'number')  hwRatio=1;
	if (x==0)  angle=Math.PI/2;
	else  angle=Math.atan( Math.abs(y/x) / hwRatio );
	if (x<0  &&  y>0)  return  Math.PI-angle;
	if (x<=0  &&  y<=0)  return  Math.PI+angle;
	if (x>=0  &&  y<0)  return  _['Π×2']-angle;
	return angle;  }

// In a circle, if you divide the circumfrence into 360 equil segments, each segment corresponds to 1 degree (1°).
// This is not so with an ellipse.  This method will adjust the angle passed in ($a) accordingly based on the value
//  of the height/width ratio ($hw) of the ellipse.
Math.Trig.scrunchAngle=function($a, $hw)  { with (Math)  {
	$a=Math.fmod($a, _['360°']);
	if (fmod($a, _['Π÷2'])==0)  return $a;
	if (_['Π×3÷2'] < $a)  return  _['Π×2'] - atan(tan(_['Π×2'] - $a) * $hw);
	if (_['Π'] < $a)  return  _['Π'] + atan(tan($a - _['Π']) * $hw);
	if (_['Π÷2'] < $a)  return  _['Π'] - atan(tan(_['Π'] - $a) * $hw);
	return  atan(tan($a) * $hw);  }  }

Math.Trig.polarToCartesian=function(r, a)  {a=Math.fmod(a, _['360°']);  return {x: r*Math.cos(a),  y: r*Math.sin(a)};}

/*==================================================================*/


SoftMoon.WebWare.canvas_graphics={
	line: function(context, sp, ep, w, style)  {
		context.beginPath();
		context.moveTo(sp.x, sp.y);
		context.lineWidth=w;
		context.strokeStyle=style;
		context.lineTo(ep.x, ep.y);
		context.stroke();  },
	shapes: {}  };
//                                                           centerpoint ↓    # of ↓vertexes    ↓ pass in function− typically “lineTo”
SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon=function(canvas, x,y, h,w, vCount, atVertex, rotate)  {
	var i, pX, pY, vertexes=[], angle;  //, out='';      //     before rotation ↑           radian value ↑ ¡not degrees!
	if (typeof rotate !== 'number')  rotate=0;
	if (rotate+=_['90°'])  {pX=Math.cos(rotate)*w+x;  pY=y-Math.sin(rotate)*h;}  // place odd-point at top
	else {pX=x+w;  pY=y;}
	canvas.moveTo(pX, pY);            angle=rotate;
	for (i=1;  vertexes.push([pX, pY, angle]), i<vCount;  i++)  {
		angle=(_['Π×2']/vCount)*i+rotate;
		pX=Math.cos(angle)*w+x;
		pY=y-Math.sin(angle)*h;
		atVertex(pX, pY);  }
	atVertex(vertexes[0][0], vertexes[0][1]);
//	for (i=0; i<6; i++)  {out+=vertexes[i][0]+'     '+vertexes[i][1]+'\n';}  alert(out);
	return vertexes;  };

SoftMoon.WebWare.canvas_graphics.rainbowRing=function(canvas, centerX, centerY, outRad, inRad, colorFilter)  {
	var j, x, y, ym, yq, a, ors=outRad*outRad, irs=inRad*inRad++;
	if (typeof colorFilter !== 'function')  colorFilter=function(h) {return h};
	for (x=-(outRad++); x<outRad; x++)  {
		for (y=Math.round(Math.sqrt(ors-x*x)),  ym=(Math.abs(x)<inRad) ? Math.round(Math.sqrt(irs-x*x)) : 0;  y>=ym;  y--)  {
			for (j=-1; j<2; j+=2)  { yq=y*j;  a=Math.Trig.getAngle(x,yq);
				canvas.fillStyle='#'+colorFilter(SoftMoon.WebWare.rgb.to.hex(SoftMoon.WebWare.rgb_from_hue(a / _['Π×2'])), a);
				canvas.beginPath();
				canvas.fillRect(centerX+x, centerY-yq, 1,1);  }  }  }  };

//                            centerpoint & size given as: pixels,angle → →↓→→→→↓   ↓ pass in function− typically “lineTo”
SoftMoon.WebWare.canvas_graphics.shapes.polarizedDiamond=function(canvas, r,a, h,w, atVertex)  {
	h=h/2; w=w/2;   //alert(r +'\n'+ a +'\n'+ h +'\n'+ w);
	var x, y, vertexes=[], out;
	with (Math)  {
	x=r*cos(fmod(a-w, _['360°'])); y=r*sin(fmod(a-w, _['360°']));
	vertexes.push([x, y]);
	canvas.moveTo(x, y);

	x=(r+h)*cos(a); y=(r+h)*sin(a);
	vertexes.push([x, y]);
	atVertex(x,y);

	x=r*cos(a+w); y=r*sin(a+w);
	vertexes.push([x, y]);
	atVertex(x,y);

	x=(r-h)*cos(a); y=(r-h)*sin(a);
	vertexes.push([x, y]);
	atVertex(x,y);
	}
	atVertex(vertexes[0][0], vertexes[0][1]);
//	for (i=0; i<4; i++)  {out+=vertexes[i][0]+'     '+vertexes[i][1]+'\n';}  alert(out);
	return vertexes;  };


/*==================================================================*/


SoftMoon.WebWare.CMYK_from_hsv=function(hsv)  {
	//Hues may be as percent/factor or degrees
	//HSV values from 0 to 100%
	//RGB results from 0 to 255
	if (typeof hsv == 'string')   with(SoftMoon)  { //RegExp may be global or a property of SoftMoon
		var matches=hsv.match(RegExp.threePercents)  ||  hsv.match(RegExp.hsv);
		if (matches)  hsv=matches.slice(1);
		else  return null;  }
	hsv[0]=SoftMoon.WebWare.rgb.getHuePercent(hsv[0]);   //    || hsv.h
	hsv[1]=hsv[1] // || hsv.s;
	hsv[2]=hsv[2] // || hsv.v;
	if ( (hsv=SoftMoon.WebWare.rgb.factorize(hsv)) === false )  return null;
	var h,c,m,y,k=1-hsv[2];
	if ( hsv[1] == 0 )  return new SoftMoon.WebWare.CMYKColor(0,0,0,k);
	h=hsv[0]-.5;  if (h<0)  h+=1;
	h = h * 6;
	if ( h >= 6 )  h = 0;
	x = h-Math.floor(h);
	if (h<1)  {c=hsv[1]; m=x*hsv[1]; y=0;}
	else
	if (h<2)  {c=(1-x)*hsv[1]; m=hsv[1]; y=0;}
	else
	if (h<3)  {c=0; m=hsv[1]; y=x*hsv[1];}
	else
	if (h<4)  {c=0; m=(1-x)*hsv[1]; y=hsv[1];}
	else
	if (h<5)  {c=x*hsv[1]; m=0; y=hsv[1];}
	else
	if (h<6)  {c=hsv[1]; m=0; y=(1-x)*hsv[1];}
	return new SoftMoon.WebWare.CMYKColor(c,m,y,k);  }


/*==================================================================*/


//  x_ColorPicker methods are are extentions of and interfaces between
//   the implementation of the Picker Class Object and the individual color-picker Classes,
//   for the MasterColorPicker implementation of Picker.
//  see also the end of this file

SoftMoon.WebWare.x_ColorPicker=new Object;

//note that these “handle…” methods may be attached directly as event-handlers for individual color-pickers,
// and the value of “this” is then the color-picker ElementNode (i.e. the <canvas> wrapper as done for
// BeezEye, RainbowMaestro, Simple² & YinYangNíHóng pickers  see below)…
// (note here not to use the <canvas> itself as this does not seem to work properly)
//but you may just as well call these as simple functions, with the value of “this” being  SoftMoon.WebWare.x_ColorPicker
SoftMoon.WebWare.x_ColorPicker.handleMouse=function(event, args)  {
	var x_Color=args.getColor(event),  flag, mode,  out;
	if (flag=event.type.match( /move|over/i )  &&  args.doUse(x_Color))  {  // note this handles mouseout also
		switch (mode=document.getElementById('palette_mode').value.toLowerCase())  {
			case 'hex':  out=x_Color.RGB.hex;
				break;
			case 'rgb':  out=x_Color.RGB.toString();
				break;
			case 'hsb':
			case 'hsv':
			case 'hsl':
			case 'hcg':
			case 'cmyk': out=SoftMoon.WebWare.rgb.to[mode](x_Color.RGB.rgb, mode).toString();
				break;
			case 'native':
			default:     out=x_Color[x_Color.model].toString();  }
		args.txtInd.firstChild.data = MasterColorPicker.applyFilters(out, x_Color);  }
	else  args.txtInd.firstChild.data=args.noClrTxt;
	args.swatch.style.backgroundColor=flag ? x_Color.RGB.hex : "";
	args.swatch.style.color=flag ? x_Color.RGB.contrast : "";  }

SoftMoon.WebWare.x_ColorPicker.handleClick=function(event, args)  {
	var x_Color=args.getColor(event), mode;
	//Note that we pass the x_Color Object to MasterColorPicker.pick as an unused second argument.
	//This x_Color Object holds an RGBColor Object (see SoftMoon.WebWare.rgb) →→ “x_Color.RGB”
	//When you create your MasterColorPicker Object (using “new Picker(………)”) you may pass in a “pickFilter”
	//function that will be passed both arguments herein passed to “MasterColorPicker.pick”
	if (args.doUse(x_Color))  switch (mode=document.getElementById('palette_mode').value.toLowerCase())  {
	case 'hex': MasterColorPicker.pick(x_Color.RGB.hex, x_Color);
		break;
	case 'rgb': MasterColorPicker.pick(x_Color.RGB.toString(), x_Color);
		break;
	case 'hsb':
	case 'hsv':
	case 'hsl':
	case 'hcg':
	case 'cmyk':
		MasterColorPicker.pick(SoftMoon.WebWare.rgb.to[mode](x_Color.RGB.rgb, mode).toString(), x_Color);
		break;
	case 'native':
	default: MasterColorPicker.pick(x_Color[x_Color.model].toString(), x_Color);
		break;  }
	return false;  }

// this is the sub-method (MasterColorPicker.pickFilter) for
//  the MasterColorPicker implementation of the Picker’s “select()” method.
// this becomes a method of the MasterColorPicker implementation, so “this” refers to  MasterColorPicker
SoftMoon.WebWare.x_ColorPicker.pickFilter=function(chosen)  { with (SoftMoon)  {  // RegExp (herein contains predefined regular expressions) may be the global standard implementation (the RegExp constructor), or a property of  SoftMoon
	var matches, thisInstance=this;
	if ((matches=chosen.match( RegExp.stdWrappedColor ))  ||  (matches=chosen.match( RegExp.stdPrefixedColor )))
		switch  (matches[1].toLowerCase())  {
		case 'rgb':  chosen=(this.useRGB ? matches[0] : matches[2]);  break;
		case 'cmyk': chosen=(this.useCMYK ? matches[0] : matches[2]);  break;  }
	else if (chosen.match( RegExp.rgb ))
		chosen=(this.useRGB ? 'RGB(' : "") + chosen + (this.useRGB ? ')' : "")
	else if (chosen.match( RegExp.cmyk ))
		chosen=(this.useCMYK ? 'CMYK(' : "") + chosen + (this.useCMYK ? ')' : "")
	else if (matches=chosen.match( RegExp.hex ))
		chosen=(this.useHash ? '#' : "") + matches[1];
	if (this.colorSwatch)     //we must wait until after the input.value is set
		setTimeout(function() {thisInstance.colorSwatch(thisInstance.dataTarget);}, 0);
	return chosen;  }  }

// this is or is called as a method of the MasterColorPicker implementation, so “this” is  MasterColorPicker
// this will read an <input> tag's value and interpret the color
// then set the background-color of it or a seperate swatch;
// text-color will then be set using “SoftMoon.WebWare.makeTextReadable()”
SoftMoon.WebWare.x_ColorPicker.colorSwatch=function(inp)  { with(SoftMoon.WebWare)  {
	var swatch, c;
	switch (this.showColorAs)  {
	case 'swatch':  swatch=(document.getElementById(inp.getAttribute('swatchId')) || inp.swatch || this.swatch || inp.nextSibling);  break;
	case 'background':
	default:  swatch=inp;  }
	if (swatch===null  ||  swatch.nodeType!==1)  return;
	if (!swatch.defaultBack)
		swatch.defaultBack=getComputedStyle(swatch).backgroundColor;
	if (!swatch.defaultBorder)
		swatch.defaultBorder=getComputedStyle(swatch).borderColor || getComputedStyle(swatch).color;
	if (inp.value.match( /^(none|blank|gap|zilch|\-|\_|\u2013|\u2014)$/i ))  {
		if (this.toggleBorder)  {
			swatch.style.borderColor=(this.borderColor==='invert') ? rgb(swatch.defaultBorder).contrast : this.borderColor;
			swatch.style.borderStyle='dotted';  }
		swatch.style.backgroundColor='transparent';
		if (swatch.defaultColor)  swatch.style.color=swatch.defaultColor;
		return;  }
	if ((c=rgb(inp.value)) != null)  {
		if (this.toggleBorder)  {
			swatch.style.borderColor=(this.borderColor==='invert') ? rgb(swatch.defaultBorder).contrast : this.borderColor;
			swatch.style.borderStyle='solid';  }
		swatch.style.backgroundColor=c.hex;
		makeTextReadable(swatch, c.rgb);
		return;  }
	if (this.toggleBorder)  {
		swatch.style.borderColor=swatch.defaultBorder;
		swatch.style.borderStyle='solid';  }
	swatch.style.backgroundColor=swatch.defaultBack;
	if (swatch.defaultColor)  swatch.style.color=swatch.defaultColor;  }  };

// text-color will be set to black or white depending on the rgb brightness (not nessesarily
//  the “perceived” brightness) of the background-color.
SoftMoon.WebWare.makeTextReadable=function(elmnt, back)  {
	if (!back)  {
		back=window.getComputedStyle(elmnt).backgroundColor.match( /^rgba?\(([^)]+)\)/i );
		if (back===null)  return;
		else back=back[1].split(',');  }
	if (!elmnt.defaultColor)
		elmnt.defaultColor=window.getComputedStyle(elmnt).color;
	elmnt.style.color=SoftMoon.WebWare.rgb.contrast(back);  };


/*==================================================================*/



(function()  { //  “globals” wrapper for BeezEye Color Picker
	var hue, saturation, color_value, settings;

SoftMoon.WebWare.BeezEye=new Object;

SoftMoon.WebWare.BeezEye.buildPalette=function()  {
	var BeezEye=document.getElementById('BeezEye'),
			palette=BeezEye.getElementsByTagName('canvas')[0],
			replacement=document.createElement('canvas'),
			canvas=replacement.getContext('2d'),
			pStylz=getComputedStyle(palette),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
//			size=settings.size.value-100,
			variety=settings.variety.value,
			center={x: Math.round(w/2), y: Math.round(h/2)},     //  w  h  ↔  size
			space={x: w/variety};     //  w ↔ size
			space.y=Math.sin(_['60°'])*space.x;
	var radius=space.y/1.5+.5,
			maxSatPoint=w/2-space.x/2,    //  w ↔ size
			model, row, cells, x, y, flag=false;

	replacement.width=w;    //  w ↔ size
	replacement.height=h;   //  h ↔ size
	palette.parentNode.replaceChild(replacement, palette);
	replacement.style.backgroundColor=pStylz.backgroundColor;
	replacement.style.border=pStylz.border;
	replacement.style.width=w+'px';    //  w ↔ size    / does not
	replacement.style.height=h+'px';   //  h ↔ size    \ take effect (at least not within a fixed-position table…)

	color_value=settings.value.value;
	for (i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value;  break;}  }

	for (rows=0;  rows<h/2;  rows+=space.y, flag=!flag)  {  // h ↔ size
		for (cells= flag ? (space.x/2) : 0;  cells<w/2;  cells+=space.x)  {   // w ↔ size
			drawHex(cells, rows);  drawHex(-cells, -rows);  drawHex(cells, -rows);  drawHex(-cells, rows);  }  }

	function drawHex(cell, row)  {
		x=center.x+cell;  y=center.y-row;
		SoftMoon.WebWare.BeezEye.calcNativeHSV(cell, row, maxSatPoint);  //→↓ globals ↓
		if (saturation>100)  return;
		canvas.fillStyle=SoftMoon.WebWare.BeezEye.nativeToRGB(hue, saturation, color_value).hex;
		canvas.beginPath();
		SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon(canvas, x, y, radius, radius, 6, function(x2, y2) {canvas.lineTo(x2, y2);});
		canvas.closePath();                                                                  // ↑ simply passing  canvas.lineTo  would be nice…
		canvas.fill();  }  }


SoftMoon.WebWare.BeezEye.nativeToRGB=function(h,s,v)  {
	var i, model;
	for (i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value;  break;}  }
	switch (model.toLowerCase())  {
		//note the rgb functions can accept values in many ways so we force it to recognize this format
	case 'cmyk':
		return SoftMoon.WebWare.rgb.from.cmyk(SoftMoon.WebWare.CMYK_from_hsv([h+'°', s+'%', v+'%']).toString('percent'));
	default:
		return SoftMoon.WebWare.rgb.from[model]([h+'°', s+'%', v+'%']);  }  }


SoftMoon.WebWare.BeezEye.calcNativeHSV=function(x, y, maxRadius)  {  // {x,y} are cartesian co-ordinates
	hue=(Math.Trig.getAngle(x,y)/Math.PI)*180;
	saturation=Math.sqrt(x*x+y*y)/maxRadius;
	var twist,
			curve= settings.curve.checked ?  settings.curve_value.value : false;   //  0 < curve <= 100
	if (settings.twist.checked  &&  saturation<1)  {
		twist=settings.twist_value.value-50;    //  0 <= twist <= 100
		hue=hue+360*(twist/50)*(1-saturation);
		if (hue<0)  hue+=360;
		if (hue>=360)  hue-=360;  }
	if (curve  &&  saturation>0  &&  saturation<1)  { with (Math)  {
		if (settings.curve_midring.checked)  {
			if (curve<=50)  curve=1-((51-curve)/50);  //  curve becomes:  0 < curve <= 1
			else            curve=((curve-50)/50)+1;  //  curve becomes:  1 < curve <= 2  //?? 2.5
			saturation=(tan( atan(tan(saturation * PI - PI/2) / curve) /2 ) + 1)/2;  }
		else  {
			if (curve<=50)  curve=1-((51-curve)/50);  //  curve becomes:  0 < curve <= 1
			else            curve=((curve-50)/25)+1;  //  curve becomes:  1 < curve <= 3
			saturation=sin(atan( tan( saturation * (PI/2) ) / curve ) + PI*1.5) + 1;  }  }  }     //			saturation=sin(atan( tan( saturation * (PI/2) ) * curve ));  }  }  }
	color_value=color_value  ||  settings.value.value;
	//  the return value variables are global to BeezEye.buildPalette and BeezEye.getColor, and the return value is threrin ignored.
	// hue format is degrees; others are as percents (0-100) although saturation may be greater than 100 meaning the color is invalid: {x,y} is out of the BeezEye
	return [hue, (saturation=saturation*100), color_value];  }


SoftMoon.WebWare.BeezEye.getColor=function(event)  {
	var BeezEye=document.getElementById('BeezEye'),
			palette=BeezEye.getElementsByTagName('canvas')[0],
			pStylz=getComputedStyle(palette),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
			center={x: Math.round(w/2), y: Math.round(h/2)},
			variety=settings.variety.value,
			space={x: w/variety};
			space.y=Math.sin(_['60°'])*space.x;
	var maxSatPoint=w/2-space.x/2,
			x=event.offsetX-center.x,
			y=center.y-event.offsetY,
			row=Math.round(y/space.y),
			clr;
	y=row*space.y;
	if (row/2===Math.round(row/2))
		x=Math.round(x/space.x)*space.x;
	else
		x=Math.floor((x)/space.x)*space.x+space.x/2;
	SoftMoon.WebWare.BeezEye.calcNativeHSV(x, y, maxSatPoint);  // globals ↓
	if (saturation>100)  return;
	return new SoftMoon.WebWare.BeezEyeColor(hue, saturation, color_value);  }


SoftMoon.WebWare.BeezEyeColor=function(h, s, v)  { // degrees, percent, percent  → but ¡NO percent marks!
	if (this===SoftMoon.WebWare)  throw new Error('BeezEyeColor is a constructor, not a function.');
	var i, model;
	for (i=0; i<settings.model.length; i++)  {
		if (settings.model[i].checked)  {model=settings.model[i].value.toUpperCase();  break;}  }
	this.model=model;
	SoftMoon.WebWare.rgb.stackSettings();
	SoftMoon.WebWare.rgb.huesByDegrees=true;
	SoftMoon.WebWare.rgb.valuesAsPercent=false;
	s=s/100;  v=v/100;
	if (model==='CMYK')  {
		this.CMYK=SoftMoon.WebWare.CMYK_from_hsv([h, s, v]);
		this.RGB=SoftMoon.WebWare.rgb.from.cmyk(this.CMYK.cmyk);  }
	else  {
		this[model]=new SoftMoon.WebWare.ColorWheelColor(h, s, v, model);
		this.RGB=SoftMoon.WebWare.rgb.from[model.toLowerCase()]([h, s, v]);  }
	SoftMoon.WebWare.rgb.popSettings();  }


with (SoftMoon.WebWare)  { // UniDOM may be global or a property of SoftMoon.WebWare
	UniDOM.addEventHandler(window, 'onload', function()  { var model, i;
		//first we set the private global members                                              ↓  this defines property names (of the array-object: settings)
		settings=UniDOM.getElementsByName(document.getElementById('BeezEye'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <inputs>s) into an array, with corresponding properties
		for (i=0; i<settings.model.length; i++)  {
			UniDOM.addEventHandler(settings.model[i], 'onchange', setColorSpace);
			if (settings.model[i].checked)  setColorSpace.call(settings.model[i], false);  }
		UniDOM.addEventHandler(settings.curve, 'onchange', setColorSpace);
		setColorSpace.call(settings.curve, false);
		UniDOM.addEventHandler(settings.twist, 'onchange', setColorSpace);
		setColorSpace.call(settings.twist, false);
		UniDOM.addEventHandler(settings.value, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.variety, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.curve_value, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.curve_midring, 'onchange', BeezEye.buildPalette);
		UniDOM.addEventHandler(settings.twist_value, 'onchange', BeezEye.buildPalette);
		var cnvsWrap=document.getElementById('BeezEye').getElementsByTagName('canvas')[0].parentNode,
				passArgs={
			doUse:  function(Color) {return Color;},
			getColor:  SoftMoon.WebWare.BeezEye.getColor,
			txtInd:  document.getElementById('BeezEye_indicator'),
			swatch:  document.getElementById('BeezEye_swatch'),
			noClrTxt: ""  };
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], x_ColorPicker.handleMouse, false, passArgs);
		UniDOM.addEventHandler(cnvsWrap, 'onclick', x_ColorPicker.handleClick, false, passArgs);
		BeezEye.buildPalette();

		function setColorSpace(flag)  { // flag is false upon startup and ==true (it’s an “onchange” Event Object) otherwise
			var lbl=settings.value.parentNode,
					crv=settings.curve_value,
					twt=settings.twist_value;
			switch (this.value)  {
			case 'cmyk': lbl.firstChild.data='Black';  lbl.childNodes[1].firstChild.data='(K)';  break;
			case 'hsv':
			case 'hsb': lbl.firstChild.data='Brightness';  lbl.childNodes[1].firstChild.data='Value';  break;
			case 'hsl': lbl.firstChild.data='Lightness';  lbl.childNodes[1].firstChild.data='';  break;
			case 'hcg': lbl.firstChild.data='Gray';  lbl.childNodes[1].firstChild.data='';  break;
			case 'curve': crv.disabled= !this.checked;  crv.parentNode.parentNode.style.visibility= this.checked ? 'visible' : 'hidden';  break;
			case 'twist': twt.disabled= !this.checked;  twt.parentNode.style.visibility= this.checked ? 'visible' : 'hidden';  break;  }
			if (flag)  BeezEye.buildPalette();  }
		});
}
})();  // close “globals” wrapper



/*==================================================================*/



SoftMoon.WebWare.RainbowMaestro=new Object;

SoftMoon.WebWare.RainbowMaestro.grayRing={inRad: 12/360, outRad: 30/360};   //default canvas width is 360 px…
SoftMoon.WebWare.RainbowMaestro.smRainbowRing={inRad: 50/360, outRad: 60/360};
SoftMoon.WebWare.RainbowMaestro.lgRainbowRing={inRad: 178/360, outRad: 180/360};
SoftMoon.WebWare.RainbowMaestro.focalHuesRing={outRad: 175/360};  //  inRad is always outRad/2

(function()  { //wrap private members

var settings, hexagonSpace;

SoftMoon.WebWare.RainbowMaestro.buildPalette=function()  {
	var oc=document.getElementById('RainbowMaestro').getElementsByTagName('canvas'),
			f, h, i, j, k, km, sa, ea, grdnt, r, x, y, temp=new Object, fb, fa, fh, sp, ep, da, dh, hueWidth,
			inRad=new Array, outRad=new Array, cnvs=new Array,
			variety=parseInt(settings.variety.value),
			maxVariety=parseInt(settings.variety.getAttribute('max')),   //  we have to use 'getAttribute' just for MSIE
			focalHue=parseFloat(settings.focalHue.value);

	if (settings.colorblind.checked)  oc.count=oc.length;  else  oc.count=1;
	if (settings.websafe.checked)  {
		settings.focalHue.value = settings.focalHue_degrees.value = focalHue = 0;
		variety=6;  }

	for (i=0; i<oc.count; i++)  {
		cnvs[i]=document.createElement('canvas');
		cnvs[i].width=oc[i].width;
		cnvs[i].height=oc[i].height;
		cnvs[i].context=cnvs[i].getContext('2d');
		cnvs[i].centerX=Math.round(cnvs[i].width/2);
		cnvs[i].centerY=Math.round(cnvs[i].height/2);
		inRad[i]= cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.grayRing.inRad;
		outRad[i]=cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.grayRing.outRad;
		oc[i].parentNode.replaceChild(cnvs[i], oc[i]);  }

	for (j=0; j<variety; j++)  {  // black-grays-white picker ring
		h=255*(j/(variety-1));  h=SoftMoon.WebWare.rgb.to.hex([h,h,h]);
		sa=_['Π×2']*(j/variety);
		ea=_['Π×2']*((j+1)/variety);
		for (i=0; i<cnvs.length; i++)  {
			cnvs[i].context.beginPath();                                             //  ↓ note the ☆insanity☆ of arc() in that angles are measured starting at 3:00 and go CLOCKWISE, yet the stroke is COUNTERCLOCKWISE by default from the second angle to the first! WHAT?
			cnvs[i].context.moveTo(cnvs[i].centerX+inRad[i]*Math.cos(sa), cnvs[i].centerY+inRad[i]*Math.sin(sa));
			cnvs[i].context.fillStyle='#'+ ((i>0) ?  SoftMoon.WebWare.rgb_to_colorblind(h)[i-1] : h);
			cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, inRad[i], sa, ea, false);
			cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, outRad[i], ea, sa, true);
			cnvs[i].context.closePath();
			cnvs[i].context.fill();  }  }

	for (i=0; i<cnvs.length; i++)  {  //  outline for black-grays-white picker ring
		grdnt=cnvs[i].context.createLinearGradient(cnvs[i].centerX, cnvs[i].centerY+inRad[i], cnvs[i].centerX, cnvs[i].centerY-inRad[i]);
		grdnt.addColorStop(0, '#FFFFFF')
		grdnt.addColorStop(1, '#000000')
		cnvs[i].context.strokeStyle=grdnt;
		cnvs[i].context.beginPath();
		cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, inRad[i], 0, _['Π×2']);
		cnvs[i].context.stroke();
		grdnt=cnvs[i].context.createLinearGradient(cnvs[i].centerX, cnvs[i].centerY+outRad[i], cnvs[i].centerX, cnvs[i].centerY-outRad[i]);
		grdnt.addColorStop(0, '#FFFFFF')
		grdnt.addColorStop(1, '#000000')
		cnvs[i].context.strokeStyle=grdnt;
		cnvs[i].context.beginPath();
		cnvs[i].context.arc(cnvs[i].centerX, cnvs[i].centerY, outRad[i], 0, _['Π×2']);
		cnvs[i].context.stroke();  }

	// color rings
	f=function(h) {return (i>0) ?  SoftMoon.WebWare.rgb_to_colorblind(h)[i-1] : h;};
	fb=function(h, a)  { return f( settings.splitComplement.checked  ?
			SoftMoon.WebWare.rgb.to.hex(
				SoftMoon.WebWare.rgb_from_hue(
					Math.fmod(
						Math.Trig.scrunchAngle(a-focalHue, _['1÷3']) + focalHue,
						_['360°'] )
					/ _['Π×2'] ) )
		: h );  };
	for (i=0; i<cnvs.length; i++)  { //cycle through each canvas
		SoftMoon.WebWare.canvas_graphics.rainbowRing(
			cnvs[i].context,  cnvs[i].centerX,  cnvs[i].centerY,
			Math.floor(cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.smRainbowRing.outRad),
			Math.floor(cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.smRainbowRing.inRad),
			f );
		SoftMoon.WebWare.canvas_graphics.rainbowRing(
			cnvs[i].context,  cnvs[i].centerX,  cnvs[i].centerY,
			Math.floor(cnvs[i].width/2),
			Math.floor(cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.lgRainbowRing.inRad),
			fb );  }

	// focal shades: hexagons arranged in a triangle
	// “loose diamonds”: mathematically-harmonious (¡NOT exactly color harmony!) hues & shades that fall between focal hues
	variety--;
	SoftMoon.WebWare.rgb.stackSettings();
	SoftMoon.WebWare.rgb.keepPrecision=false;
	SoftMoon.WebWare.rgb.huesByDegrees=false;
	SoftMoon.WebWare.rgb.valuesAsPercent=false;
	var lineTo=function(x2, y2) {cnvs[i].context.lineTo(x2, y2);};

	for (i=0; i<cnvs.length; i++)  { //cycle through each canvas
		outRad=Math.floor(cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.focalHuesRing.outRad);
		space={y: Math.tan(_['30°'])*outRad / variety,
					 w: _['60°']/maxVariety };
		space.x=Math.sin(_['60°'])*space.y;
		space.h=space.x*.854;
		if (i===0)  hexagonSpace=space;  //glogal save for getColor
		h_r=space.y/1.5;  //hexagon radius
		cnvs[i].context.save();
		cnvs[i].context.translate(cnvs[i].centerX, cnvs[i].centerY);

		if (!settings.focalsOnly.checked)  for (f=0; f<6; f++)  { //cycle through 6 intermix sections
	// “loose Diamonds”
			for (j=2; j<=variety; j++)  { for (n=1, hueWidth=_['60°']/j, halfHW=hueWidth/2+space.w/2;  n<j;  n++)  {
				da=f*_['60°']+hueWidth*n;
				dh= (settings.splitComplement.checked  &&  !settings.websafe.checked) ?
					Math.Trig.scrunchAngle(da, _['1÷3'])
				: da;
				da=Math.fmod(da-focalHue, _['360°']);
				dh=Math.fmod(dh-focalHue, _['360°']);
				r=outRad-(variety-j)*space.h-space.h/2;
				for (k=0, km=variety-j+1; k<km; k++)  {
					a=da - (space.w*(variety-j+1)/2) + space.w*(k+.5);
					if (a<da-halfHW  ||  a>da+halfHW)  continue;
					a=Math.fmod(a,  _['360°']);
					h=SoftMoon.WebWare.rgb.from.hcg([1-dh/_['360°'],  j/variety,  km>1 ? (k/(km-1)) : .5]);
					cnvs[i].context.fillStyle= (i>0) ?  '#'+SoftMoon.WebWare.rgb_to_colorblind(h.rgb)[i-1]  :  h.hex;
					cnvs[i].context.beginPath();
					SoftMoon.WebWare.canvas_graphics.shapes.polarizedDiamond(cnvs[i].context, r, a, space.h, space.w, lineTo);
					cnvs[i].context.closePath();                                                                   // ↑ simply passing  cnvs[i].context.lineTo  would be nice…
					cnvs[i].context.fill();  }  }  }  }

		for (f=0; f<6; f++)  { //cycle through 6 focal hues
			fa=f*_['60°'];
			fh= (settings.splitComplement.checked  &&  !settings.websafe.checked) ?
				Math.Trig.scrunchAngle(fa, _['1÷3'])
			: fa;
			fa=Math.fmod(fa-focalHue, _['360°']);
			fh=Math.fmod(fh-focalHue, _['360°']);
			if (settings.splitComplement.checked  &&  !settings.websafe.checked)  {
				sp=Math.Trig.polarToCartesian(cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.focalHuesRing.outRad/2, fa);
				ep=Math.Trig.polarToCartesian(cnvs[i].width*SoftMoon.WebWare.RainbowMaestro.smRainbowRing.outRad,   fh);
				SoftMoon.WebWare.canvas_graphics.line(cnvs[i].context, sp, ep, 3, '#000000');
				SoftMoon.WebWare.canvas_graphics.line(cnvs[i].context, sp, ep, 1, '#FFFFFF');  }
			cnvs[i].context.save();
			cnvs[i].context.rotate(fa);
	// focal hues triangles
			for (j=0; j<variety; j++)  { for (k=0; k<=j; k++)  {
				h=SoftMoon.WebWare.rgb.from.hcg([1-fh/_['360°'], 1-j/variety, (j==0) ? 0 : k/j]);
				cnvs[i].context.fillStyle= (i>0) ?  '#'+SoftMoon.WebWare.rgb_to_colorblind(h.rgb)[i-1]  :  h.hex;
				cnvs[i].context.beginPath();
				x=outRad-j*space.x-space.x/2;
				y=space.y*j/2 - space.y*k;
				SoftMoon.WebWare.canvas_graphics.shapes.regularPolygon(cnvs[i].context, x, y, h_r, h_r, 6, lineTo, _['90°']);
				cnvs[i].context.closePath();                                                            // ↑ simply passing  cnvs[i].context.lineTo  would be nice…
				cnvs[i].context.fill();  }  }
			cnvs[i].context.restore();  }
		cnvs[i].context.restore();  }
	SoftMoon.WebWare.rgb.popSettings();  };  // close  RainbowMaestro.buildPalette



var mouseColor; //private member

SoftMoon.WebWare.RainbowMaestro.getColor=function(event)  { mouseColor=null;
	if (event.target===event.currentTarget)  return null;
	SoftMoon.WebWare.rgb.stackSettings();
	SoftMoon.WebWare.rgb.valuesAsByte=true;
	SoftMoon.WebWare.rgb.valuesAsPercent=false;
	SoftMoon.WebWare.rgb.huesByDegrees=true;
	var pStylz=getComputedStyle(event.target),
			w=parseInt(pStylz.width),
			h=parseInt(pStylz.height),
			x=event.offsetX-Math.round(w/2),
			y=Math.round(h/2)-event.offsetY,
			a=Math.Trig.getAngle(x, y),
			r=Math.sqrt(x*x+y*y),
			variety=parseInt(settings.variety.value),
			focalHue=parseFloat(settings.focalHue.value),
			color=(function()  {
	if (r<w*SoftMoon.WebWare.RainbowMaestro.grayRing.inRad)  return null;
	if (r<w*SoftMoon.WebWare.RainbowMaestro.grayRing.outRad)  {
		var c=255-Math.floor(a*variety/_['360°'])*(255/(variety-1));
		return mouseColor=new SoftMoon.WebWare.RainbowMaestro.MaestroColor(
				SoftMoon.WebWare.rgb(c,c,c),  0, 0, c/255,  'grays');  }
	if (r<w*SoftMoon.WebWare.RainbowMaestro.smRainbowRing.inRad)  return null;
	if (r<w*SoftMoon.WebWare.RainbowMaestro.smRainbowRing.outRad)  {
		if (settings.websafe.checked)  a=Math.round(a/_['24°'])*_['24°'];
		return mouseColor=new SoftMoon.WebWare.RainbowMaestro.MaestroColor(
				SoftMoon.WebWare.rgb(SoftMoon.WebWare.rgb_from_hue(a/_['360°'])),  a, 1, .5, 'smRainbow', a);  }
	if (r<w*SoftMoon.WebWare.RainbowMaestro.focalHuesRing.outRad/2)
		return mouseColor={targetHue: a};
	if (r<w*SoftMoon.WebWare.RainbowMaestro.focalHuesRing.outRad)  {

		focalHueTriangle: {
		var fa=Math.round(Math.fmod(a-focalHue, _['360°'])/_['60°'])*_['60°']+focalHue,
				cgp=Math.Trig.polarToCartesian(r, a-fa),  //get chroma/gray point: {x,y} calculated as if the color-triangle in question is rotated to point the full-color tip to the 3:00 (0°) position, i.e. the tip is on the positive x-axis
				chroma= Math.floor((w*SoftMoon.WebWare.RainbowMaestro.focalHuesRing.outRad-cgp.x)/(hexagonSpace.x));  //inverse progression from Chroma-factor
		if (chroma>variety-2)  return null;  //break focalHueTriangle;  //area just below focal triangles - currently unused.
		var gray= Math.floor((cgp.y+(chroma+1)*hexagonSpace.y/2)/hexagonSpace.y);  //get gray level
		if (gray<0  ||  gray>chroma)  break focalHueTriangle;
		gray=(chroma===0) ? .5 : gray/chroma;  //get gray factor
		chroma=1-chroma/(variety-1);  //get chroma factor
		if (settings.splitComplement.checked  &&  !settings.websafe.checked)
			fa=Math.Trig.scrunchAngle(fa-focalHue, _['1÷3'])+focalHue;
		fa=Math.fmod(fa, _['360°']);
		return mouseColor=new SoftMoon.WebWare.RainbowMaestro.MaestroColor(
				SoftMoon.WebWare.rgb.from.hcg([180*(fa/_['Π'])+'°', chroma*100+'%', gray*100+'%']),
				fa, chroma, gray, 'focalTriangles');  }

		looseDiamonds: {
		if (settings.focalsOnly.checked)  break looseDiamonds;
		chroma=Math.ceil((r-w*SoftMoon.WebWare.RainbowMaestro.focalHuesRing.outRad+(variety-1)*hexagonSpace.h) / hexagonSpace.h) ;
		if (chroma<2) break looseDiamonds;
		fa= _['60°'] / chroma;
		fa=Math.fmod(Math.round(Math.fmod(a-focalHue, _['360°'])/fa)*fa+focalHue, _['360°']);
		chroma=variety - chroma - 1;
		gray=Math.round(Math.fmod(a-(fa-hexagonSpace.w*chroma/2), _['360°'])/hexagonSpace.w);  //get gray level
		if (gray<0  ||  gray>chroma)  break looseDiamonds;
		gray=(chroma===0) ? .5 : 1-gray/chroma;  //get gray factor
		chroma=1-chroma/(variety-1);  //get chroma factor
		if (settings.splitComplement.checked  &&  !settings.websafe.checked)
			fa=Math.fmod(Math.Trig.scrunchAngle(fa-focalHue, _['1÷3'])+focalHue, _['360°']);
		return mouseColor=new SoftMoon.WebWare.RainbowMaestro.MaestroColor(
				SoftMoon.WebWare.rgb.from.hcg([180*(fa/_['Π'])+'°', chroma*100+'%', gray*100+'%']),
				fa, chroma, gray, 'looseDiamonds');  }

		return null;  }

	if (r>=w*SoftMoon.WebWare.RainbowMaestro.lgRainbowRing.inRad
	&&  r<=w*SoftMoon.WebWare.RainbowMaestro.lgRainbowRing.outRad)  {
	if (settings.websafe.checked)  a=Math.round(a/_['24°'])*_['24°'];
	else if (settings.splitComplement.checked)
			a=Math.fmod(Math.Trig.scrunchAngle(a-focalHue, _['1÷3'])+focalHue, _['360°']);
		return mouseColor=new SoftMoon.WebWare.RainbowMaestro.MaestroColor(
				SoftMoon.WebWare.rgb(SoftMoon.WebWare.rgb_from_hue(a/_['360°'])),  a, 1, .5, 'lgRainbow', a);  }

	})();
	SoftMoon.WebWare.rgb.popSettings();
	return color;  }  //close getColor



SoftMoon.WebWare.RainbowMaestro.MaestroColor=function(RGB, H, C, G, ring, targetHue)  {
	if (this===SoftMoon.WebWare)  throw new Error('MaestroColor is a constructor, not a function.');
	this.RGB=RGB;
	this.model='HCG';
	this.HCG=new SoftMoon.WebWare.ColorWheelColor((Math.fmod(H, _['Π×2'])/_['Π']) * (SoftMoon.WebWare.rgb.huesByDegrees ? 180 : .5), C, G, 'HCG');
	this.ring=ring;
	this.targetHue=targetHue;  }



/******note below that  x_ColorPicker.handle……  calls  RainbowMaestro.getColor  before  RainbowMaestro.handle……  is called******/

SoftMoon.WebWare.RainbowMaestro.handleMouseover=function()  {
	if (!settings.lock.checked  && !settings.websafe.checked)  {
		var hueIndicator=document.getElementById('RainbowMaestro_hueIndicator').lastChild.firstChild;
		hueIndicator.data=(mouseColor && mouseColor.targetHue)  ?
			(Math.roundTo((mouseColor.targetHue/Math.PI)*180, 5)+'°')  :  "";
		hueIndicator.parentNode.style.display=(mouseColor && mouseColor.targetHue)  ?  'inline-block' : '';  }
	with (SoftMoon.WebWare)  {  //UniDOM may be global or a property of SoftMoon.WebWare
	var spsw=UniDOM.getElementsByClassName(document.getElementById('RainbowMaestro'), 'subpalette_swatch');
	if (!settings.colorblind.checked)  spsw.length=1;
	for (var i=0; i<spsw.length; i++)  {
		spsw[i].style.backgroundColor= (mouseColor && mouseColor.ring)  ?
			((i>0) ?  '#'+rgb_to_colorblind(mouseColor.RGB.rgb)[i-1]  :  mouseColor.RGB.hex)
		: "";  }  }  };

SoftMoon.WebWare.RainbowMaestro.handleClick=function()  {
	if (!settings.lock.checked && !settings.websafe.checked  &&  mouseColor && mouseColor.targetHue)  {
		settings.focalHue.value=mouseColor.targetHue;
		settings.focalHue_degrees.value=Math.roundTo(180*(mouseColor.targetHue/Math.PI), 5);
		SoftMoon.WebWare.RainbowMaestro.buildPalette();  }  }

SoftMoon.WebWare.RainbowMaestro.showColorblind=function()  {
	with (SoftMoon.WebWare)  {  //UniDOM may be global or a property of SoftMoon.WebWare
	UniDOM.useClassName(document.getElementById('RainbowMaestro'), 'no_colorblind', !this.checked);
	if (this.checked) RainbowMaestro.buildPalette();  }  }

SoftMoon.WebWare.RainbowMaestro.makeWebsafe=function(flag)  {
	if (settings.lock.checked)  this.checked=false;
	else
	if (this.checked  ||  flag===true)  { settings.websafe.checked=true;
		settings.focalsOnly.checked=false;
		settings.variety.value='6';
		settings.splitComplement.checked=false;
		SoftMoon.WebWare.RainbowMaestro.buildPalette();  }  }

SoftMoon.WebWare.RainbowMaestro.makeSplitComplement=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	if (settings.lock.checked)  this.checked=false;
	else  {
		if (flag)  { settings.splitComplement.checked=true;
			settings.websafe.checked=false;  }
		SoftMoon.WebWare.RainbowMaestro.buildPalette();  }  }

SoftMoon.WebWare.RainbowMaestro.alterVariety=function(value)  {
	if (settings.lock.checked)  return;
	settings.websafe.checked=false;
	if (typeof value == 'number'  ||  (typeof value == 'string' &&  value.match( /^[0-9]+$/ )))
		settings.variety.value=value;
	SoftMoon.WebWare.RainbowMaestro.buildPalette();  }

SoftMoon.WebWare.RainbowMaestro.lock=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	else  this.checked=flag;
	settings.websafe.disabled=flag;
	settings.splitComplement.disabled=flag;
	settings.variety.disabled=flag;
	settings.focalHue_degrees.disabled=flag;  }

SoftMoon.WebWare.RainbowMaestro.handle_focalsOnly=function(flag)  {
	if (typeof flag !== 'boolean')  flag=this.checked;
	else  settings.focalsOnly.checked=flag;
	if (flag)  settings.websafe.checked=false;
	SoftMoon.WebWare.RainbowMaestro.buildPalette();  }

SoftMoon.WebWare.RainbowMaestro.setFocalHue=function(hueAngle, radianFlag)  {  hueAngle=parseFloat(hueAngle);
	if (radianFlag)  {
			settings.focalHue.value=hueAngle;
			settings.focalHue_degrees.value=(hueAngle/Math.PI)*180;  }
	else  {
			settings.focalHue.value=(hueAngle/180)*Math.PI;
			settings.focalHue_degrees.value=hueAngle;  }
	SoftMoon.WebWare.RainbowMaestro.buildPalette();  }

with (SoftMoon.WebWare)  { // UniDOM may be global or a property of SoftMoon.WebWare
	UniDOM.addEventHandler( window, 'onload', function()  {
		//first we set the private global members                                              ↓  this defines property names (of the array-object: settings)
		settings=UniDOM.getElementsByName(document.getElementById('RainbowMaestro'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <inputs>s) into an array, with corresponding properties
		RainbowMaestro.buildPalette();
		UniDOM.addEventHandler(settings.websafe, 'onclick', RainbowMaestro.makeWebsafe);
		UniDOM.addEventHandler(settings.splitComplement, 'onclick', RainbowMaestro.makeSplitComplement);
		UniDOM.addEventHandler(settings.lock, 'onclick', RainbowMaestro.lock);
		UniDOM.addEventHandler(settings.colorblind, 'onclick', RainbowMaestro.showColorblind);
		UniDOM.addEventHandler(settings.variety, 'onmouseup', RainbowMaestro.alterVariety);
		UniDOM.addEventHandler(settings.focalsOnly, 'onclick', RainbowMaestro.handle_focalsOnly);

		MasterColorPicker.registerInterfaceElement(settings.focalHue_degrees, {tabToTarget: true});
		UniDOM.addEventHandler(settings.focalHue_degrees, 'onkeydown', function(event) {
			var keepKey=(event.keyCode<48 || event.keyCode==144  //basic function keys and numlock
			|| (event.keyCode>=112  && event.keyCode<=123) //f1-f12
			|| ( !(event.altKey || event.ctrlKey || event.shiftKey)
					&& ((event.keyCode>=48  &&  event.keyCode<=57)  //numbers above letters
							|| (event.keyCode>=96  &&  event.keyCode<=105)  //number keypad         ↓decimal & period
							|| ((event.keyCode==110 || event.keyCode==190)  &&  this.value.match( /\./ )===null))));  //note the odd behavior of the value attribute of <input type='number' />.  Although (typeOf value == string), it may have extranious decimals parsed off (yet displayed to the user) so we can’t filter them out…
			if (!keepKey)  event.preventDefault();  });
		UniDOM.addEventHandler(settings.focalHue_degrees, 'onchange', function()  {
			settings.websafe.checked=false;
			this.value.replace( /[^-0-9.]/ , "");
			while (this.value<0)  {this.value=parseFloat(this.value)+360;}
			while (this.value>360)  {this.value=parseFloat(this.value)-360;}
			settings.focalHue.value=(parseFloat(this.value)/180)*Math.PI;  //set the hidden input to radians
			RainbowMaestro.buildPalette();  } );

		var cnvsWrap=document.getElementById('RainbowMaestro').getElementsByTagName('canvas')[0].parentNode,
				passArgs={
			doUse:  function(MaestroColor)  {return MaestroColor && MaestroColor.ring;},
			getColor:  RainbowMaestro.getColor,
			txtInd:  document.getElementById('RainbowMaestro_indicator'),
			swatch:  document.getElementById('RainbowMaestro_swatch'),
			noClrTxt: "" };
		UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], [x_ColorPicker.handleMouse, RainbowMaestro.handleMouseover], false, passArgs);  // ← both events call both handlers
		UniDOM.addEventHandler(cnvsWrap, 'onclick', [x_ColorPicker.handleClick, RainbowMaestro.handleClick], false, passArgs);  // ←  ↑  note that multiple handlers are called in order
			} );  }

})();  //close  wrap private members




/*==================================================================*/
SoftMoon.WebWare.SimpleSqColorPicker=new Object;

(function() { var settings, variety, cnvs, sbcnvs=new Array();

	function initBuild(id)  {
		var wp=document.getElementById(id),
				oc=wp.getElementsByTagName('canvas')[0],
				xcnvs;
		variety=parseInt(settings.variety.value);
		xcnvs=document.createElement('canvas');
		xcnvs.width=oc.width;
		xcnvs.height=oc.height;
		wp.replaceChild(xcnvs, oc);
		xcnvs.context=xcnvs.getContext('2d');
		SoftMoon.WebWare.rgb.stackSettings();
		SoftMoon.WebWare.rgb.huesByDegrees=false;
		SoftMoon.WebWare.rgb.valuesAsPercent=false;
		return xcnvs;  }

SoftMoon.WebWare.SimpleSqColorPicker.buildPalette=function()  {
	cnvs=initBuild('Simple²wrapper');
	var space={ x: cnvs.width/(variety+1),
							y: cnvs.height/variety },
			centerX=cnvs.width/2,
			x, y;
	for (x=0; x<cnvs.width; x+=space.x)  { for (y=0; y<cnvs.height; y+=space.y)  {
		try {
		cnvs.context.fillStyle=SoftMoon.WebWare.rgb.from.hcg([
			y/cnvs.height,
			1-Math.abs((centerX-x-space.x/2)/(centerX-space.x/2)),
			(x<centerX) ? 0 : 1
		]).hex;
		} catch(e) {continue;}   //round-off errors at high-end of palette
		cnvs.context.beginPath();
		cnvs.context.fillRect(x, y, space.x+.5, space.y+.5);  }  }
	SoftMoon.WebWare.rgb.popSettings();
	updateIndicators();
	updateAllSubs();  }

var space, c, hue=.5, sat=.5, lvl=.5;
	function build_sats(model)  {
	var y;  //
	for (y=0; y<variety+1; y++)  {
		sbcnvs[c].context.fillStyle=SoftMoon.WebWare.rgb.from[model]([hue, y/variety, lvl]).hex;
		sbcnvs[c].context.beginPath();
		sbcnvs[c].context.fillRect(0, y*space,  sbcnvs[c].width, space+.5);  }
	SoftMoon.WebWare.rgb.popSettings();
	y=sat*variety*space+space/2;
	sbcnvs[c].context.strokeWidth=2.618;
	sbcnvs[c].context.strokeStyle='#000000';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(0, y-5);
	sbcnvs[c].context.lineTo(sbcnvs[c].width/2, y);
	sbcnvs[c].context.lineTo(0, y+5);
	sbcnvs[c].context.stroke();
	sbcnvs[c].context.strokeStyle='#FFFFFF';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(sbcnvs[c].width, y-5);
	sbcnvs[c].context.lineTo(sbcnvs[c].width/2, y);
	sbcnvs[c].context.lineTo(sbcnvs[c].width, y+5);
	sbcnvs[c].context.stroke();  }

	function build_lvls(model)  {
	var x;
	for (x=0; x<variety+1; x++)  {
		sbcnvs[c].context.fillStyle=SoftMoon.WebWare.rgb.from[model]([hue, sat, x/variety]).hex;
		sbcnvs[c].context.beginPath();
		sbcnvs[c].context.fillRect(x*space, 0,  space+.5, sbcnvs[c].height);  }
	SoftMoon.WebWare.rgb.popSettings();
	x=lvl*variety*space+space/2;
	sbcnvs[c].context.strokeWidth=2.618;
	sbcnvs[c].context.strokeStyle='#000000';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(x-5, 0);
	sbcnvs[c].context.lineTo(x, sbcnvs[c].height/2);
	sbcnvs[c].context.lineTo(x+5, 0);
	sbcnvs[c].context.stroke();
	sbcnvs[c].context.strokeStyle='#FFFFFF';
	sbcnvs[c].context.beginPath();
	sbcnvs[c].context.moveTo(x-5, sbcnvs[c].height);
	sbcnvs[c].context.lineTo(x, sbcnvs[c].height/2);
	sbcnvs[c].context.lineTo(x+5, sbcnvs[c].height);
	sbcnvs[c].context.stroke();  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hSv=function()  {
	sbcnvs[c=0]=initBuild('Simple²hSv');
	space=sbcnvs[c].height/(variety+1);
	build_sats('hsv');  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hSl=function()  {
	sbcnvs[c=1]=initBuild('Simple²hSl');
	space=sbcnvs[c].height/(variety+1),
	build_sats('hsl');  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hsV=function()  {
	sbcnvs[c=2]=initBuild('Simple²hsV');
	space=sbcnvs[c].width/(variety+1);
	build_lvls('hsv');  }

SoftMoon.WebWare.SimpleSqColorPicker.build_hsL=function()  {
	sbcnvs[c=3]=initBuild('Simple²hsL');
	space=sbcnvs[c].width/(variety+1);
	build_lvls('hsl');  }

var moHue, moSat, moLvl;

SoftMoon.WebWare.SimpleSqColorPicker.handleClick=new Object;
SoftMoon.WebWare.SimpleSqColorPicker.getColor=new Object;

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hcg=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>cnvs.width || event.offsetY>cnvs.height)  return false;
	var satBlock=Math.floor((event.offsetX/(cnvs.width/(variety+1)))),
			fullSatBlock=Math.floor(variety/2);
	moHue=Math.floor((event.offsetY/cnvs.height)*variety)/variety,
	moSat=1-Math.abs(fullSatBlock-satBlock)/fullSatBlock;
	return getColor('hcg', moHue, moSat, Math.floor(event.offsetX/(cnvs.width/2)));  }

	function getColor(model, h, c_s, g_b_l)  { var RGB, clr;
		SoftMoon.WebWare.rgb.stackSettings();
		SoftMoon.WebWare.rgb.huesByDegrees=false;
		SoftMoon.WebWare.rgb.valuesAsPercent=false;
		if (RGB=SoftMoon.WebWare.rgb.from[model]([h, c_s, g_b_l]))  {
			model=model.toUpperCase();
			clr={RGB: RGB, model: model};
			clr[model]=new SoftMoon.WebWare.ColorWheelColor(h, c_s, g_b_l, model);  }
		else clr=false;
		SoftMoon.WebWare.rgb.popSettings();
		return clr;  }

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hcg=function(event) {
	hue=moHue;
	if (!settings.lock.checked)  sat=moSat;
	updateAllSubs();
	updateIndicators();  }

	function updateAllSubs()  { with(SoftMoon.WebWare.SimpleSqColorPicker)  {
		build_hSv();
		build_hSl();
		build_hsV();
		build_hsL();  }  };

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hSl=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[0].width || event.offsetY>sbcnvs[0].height)  return false;
	moSat=Math.floor(event.offsetY/(sbcnvs[0].height/(variety+1)))/variety;
	return getColor('hsl', hue, moSat, lvl);  }

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hSv=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[1].width || event.offsetY>sbcnvs[1].height)  return false;
	moSat=Math.floor(event.offsetY/(sbcnvs[1].height/(variety+1)))/variety;
	return getColor('hsb', hue, moSat, lvl);  }

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hsV=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[2].width || event.offsetY>sbcnvs[2].height)  return false;
	moLvl=Math.floor(event.offsetX/(sbcnvs[2].width/(variety+1)))/variety;
	return getColor('hsb', hue, sat, moLvl);  }

SoftMoon.WebWare.SimpleSqColorPicker.getColor.hsL=function(event)  {
	if (event.offsetX<0 || event.offsetY<0 || event.offsetX>sbcnvs[3].width || event.offsetY>sbcnvs[3].height)  return false;
	moLvl=Math.floor(event.offsetX/(sbcnvs[3].width/(variety+1)))/variety;
	return getColor('hsl', hue, sat, moLvl);  }

	function updateIndicators()  {
		document.getElementById('Simple²hue').firstChild.data=Math.roundTo(hue*360, 3)+'°';
		document.getElementById('Simple²saturation').firstChild.data=Math.roundTo(sat*100, 1)+'%';
		document.getElementById('Simple²lvl').firstChild.data=Math.roundTo(lvl*100, 1)+'%';
	}

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hSl=function(event)  {
	if (settings.lock.checked)  return;
	sat=moSat;
	updateAllSubs();
	updateIndicators();  }

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hSv=SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hSl;

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hsV=function(event)  {
	if (settings.lock.checked)  return;
	lvl=moLvl;
	updateAllSubs();
	updateIndicators();  }

SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hsL=SoftMoon.WebWare.SimpleSqColorPicker.handleClick.hsV;

with (SoftMoon.WebWare)  { // UniDOM may be global or a property of SoftMoon.WebWare
	UniDOM.addEventHandler( window, 'onload', function()  {
		//first we set the private global members                                       ↓  this defines property names (of the array-object: settings)
		settings=UniDOM.getElementsByName(document.getElementById('Simple²'), "", true, function(n) {return n.name.match( /_(.+)$/ )[1];}); // grabs all the elements with a 'name' attribute (the <inputs>s) into an array, with corresponding properties

		UniDOM.addEventHandler(settings.variety, 'onMouseUp', SimpleSqColorPicker.buildPalette);
		var i, cnvsWrap, passArgs, wraps=[
			{id: 'Simple²wrapper', model: 'hcg'},
			{id: 'Simple²hSl', model: 'hSl'},
			{id: 'Simple²hSv', model: 'hSv'},
			{id: 'Simple²hsV', model: 'hsV'},
			{id: 'Simple²hsL', model: 'hsL'}
			 ];
		for (i=0; i<wraps.length; i++)  {
			cnvsWrap=document.getElementById(wraps[i].id);
			passArgs={
				doUse:  function(Color) {return Color;},
				getColor:  SimpleSqColorPicker.getColor[wraps[i].model],
				txtInd:  document.getElementById('Simple²indicator'),
				swatch:  document.getElementById('Simple²swatch'),
				noClrTxt: String.fromCharCode(160)  };
			UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], x_ColorPicker.handleMouse, false, passArgs);
			UniDOM.addEventHandler(cnvsWrap, 'onclick', [x_ColorPicker.handleClick, SimpleSqColorPicker.handleClick[wraps[i].model]], false, passArgs);  }

		SoftMoon.WebWare.SimpleSqColorPicker.buildPalette();  } );  }

})();
/*==================================================================*/




;(function () {                    // ↓radians    ↓factor(0-1)
var baseCanvas, mainCanvas, settings, focalHue=0, swatchHue=0, aniOffset=0, Color;

SoftMoon.WebWare.YinYangNiHong=new Object;

SoftMoon.WebWare.YinYangNiHong.buildBasePalette=function()  {
	baseCanvas=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas')[0];
	baseCanvas.context=baseCanvas.getContext('2d');
	baseCanvas.centerX=baseCanvas.width/2;
	baseCanvas.centerY=baseCanvas.height/2;
	var inRad=Math.min(baseCanvas.centerX, baseCanvas.centerY)-13;

	baseCanvas.context.beginPath();
	baseCanvas.context.fillStyle='#FFFFFF';
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY, inRad, 0, _['Π×2']);
	baseCanvas.context.fill();
	baseCanvas.context.beginPath();
	baseCanvas.context.fillStyle='#000000';
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY+inRad/2, inRad/2, _['Π÷2'], _['Π×3÷2'], false);
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY-inRad/2, inRad/2, _['Π÷2'], _['Π×3÷2'], true);
	baseCanvas.context.arc(baseCanvas.centerX, baseCanvas.centerY, inRad, _['Π×3÷2'], _['Π÷2'], false);
	baseCanvas.context.fill();

	inRad=Math.floor(inRad);
	SoftMoon.WebWare.canvas_graphics.rainbowRing(
		baseCanvas.context,  Math.floor(baseCanvas.centerX), Math.floor(baseCanvas.centerY),  inRad+13, inRad );  }


SoftMoon.WebWare.YinYangNiHong.buildHueSwatches=function(hue)  { //hue should be between 0-1
	if (typeof hue === 'undefined')  hue=swatchHue;
	SoftMoon.WebWare.rgb.stackSettings();
	SoftMoon.WebWare.rgb.huesByDegrees=false;
	SoftMoon.WebWare.rgb.valuesAsPercent=false;
	var canvases=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas'),
			cnvs=document.createElement('canvas'),
			grad;
	cnvs.width=87;   //see animate
	cnvs.height=297;
	if (canvases[1])
		canvases[1].parentNode.replaceChild(cnvs, canvases[1]);
	else  canvases[0].parentNode.appendChild(cnvs);
	cnvs.context=cnvs.getContext('2d');
	cnvs.context.beginPath();
	grad=cnvs.context.createRadialGradient(43.5, 43.5,0, 43.5, 43.5,43.5);
	if (aniOffset)
		grad.addColorStop(0, SoftMoon.WebWare.rgb.from.hcg([hue, 1-aniOffset, 0]).hex);
	grad.addColorStop(1-aniOffset, SoftMoon.WebWare.rgb.from.hcg([hue, 1, 0]).hex);
	grad.addColorStop(1, SoftMoon.WebWare.rgb.from.hcg([hue, 1-aniOffset, 0]).hex);
	cnvs.context.fillStyle=grad;
	cnvs.context.arc(43.5, 43.5, 43.5, 0, _['Π×2']);
	cnvs.context.fill();
	cnvs.context.beginPath();
	grad=cnvs.context.createRadialGradient(43.5, 253.5, 0,  43.5, 253.5, 43.5);
	if (aniOffset)
		grad.addColorStop(0, SoftMoon.WebWare.rgb.from.hcg([hue, aniOffset, 1]).hex);
	grad.addColorStop(aniOffset, SoftMoon.WebWare.rgb.from.hcg([hue, 1, 1]).hex);
	grad.addColorStop(1, SoftMoon.WebWare.rgb.from.hcg([hue, aniOffset, 1]).hex);
	cnvs.context.fillStyle=grad;
	cnvs.context.arc(43.5, 253.5, 43.5, 0, _['Π×2']);
	cnvs.context.fill();
	SoftMoon.WebWare.rgb.popSettings();  }




SoftMoon.WebWare.YinYangNiHong.buildPalette=function()  {
	var canvases=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas'),
			cnvs=document.createElement('canvas'),
			hue=SoftMoon.WebWare.rgb( SoftMoon.WebWare.rgb_from_hue(focalHue/_['Π×2']), true ),
			grad;
	mainCanvas=cnvs;
	cnvs.width=256;
	cnvs.height=256;
	if (canvases[2])
		canvases[2].parentNode.replaceChild(cnvs, canvases[2]);
	else  canvases[0].parentNode.appendChild(cnvs);
	cnvs.context=cnvs.getContext('2d');
	var mode, i;
	for (i=0; i<settings.length; i++)  {if (settings[i].checked)  {mode=settings[i].value;  break;}}
	switch (mode.toUpperCase())  {
	case 'HSV':
	case 'HSB':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 0,256);
			grad.addColorStop(0, hue.toString('wrapped byte'));
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, 'rgba(0,0,0,1)');
			grad.addColorStop(1, 'rgba(0,0,0,0)');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			break;
	case 'HSL':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, '#000000');
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			grad=cnvs.context.createLinearGradient(0,0, 0,256);
			hue.a=127;
			grad.addColorStop(0, hue.toString('wrapped byte'));
			hue.a=0;
			grad.addColorStop(1, hue.toString('wrapped byte'));
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, 'rgba(0,0,0,1)');
			grad.addColorStop(.5, 'rgba(128,128,128,0)');
			grad.addColorStop(1, 'rgba(255,255,255,1)');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			break;
	case 'HCG':
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 256,0);
			grad.addColorStop(0, '#000000');
			grad.addColorStop(1, '#FFFFFF');
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);
			cnvs.context.beginPath();
			grad=cnvs.context.createLinearGradient(0,0, 0,256);
			hue.a=127;
			grad.addColorStop(0, hue.toString('wrapped byte', true));
			hue.a=0;
			grad.addColorStop(1, hue.toString('wrapped byte', true));
			cnvs.context.fillStyle=grad;
			cnvs.context.fillRect(0,0, 256, 256);  }  }


SoftMoon.WebWare.YinYangNiHong.getColor=function(event)  {
	var x=event.offsetX-baseCanvas.centerX,
			y=baseCanvas.centerY-event.offsetY,
			r=Math.sqrt(x*x+y*y),
			fa, mode, i;
	Color=null;
	for (i=0; i<settings.length; i++)  {if (settings[i].checked)  {mode=settings[i].value.toUpperCase();  break;}}
	if (event.target===baseCanvas)  {
		if (r>baseCanvas.centerX  ||  r<baseCanvas.centerX-13)  return null;
		fa=Math.Trig.getAngle(x,y);
		SoftMoon.WebWare.rgb.stackSettings();
		SoftMoon.WebWare.rgb.huesByDegrees=false;
		SoftMoon.WebWare.rgb.valuesAsPercent=false;
		Color={
			RGB: SoftMoon.WebWare.rgb( SoftMoon.WebWare.rgb_from_hue(fa/_['Π×2']) ),
			model: mode,
			focal: fa };
		Color[mode]=new SoftMoon.WebWare.ColorWheelColor(fa/_['Π×2'], 1, (mode=='HSL') ? .5 : 1, mode, false);
		SoftMoon.WebWare.rgb.popSettings();
		return Color;  }
	if (event.target===mainCanvas)  {
		x=event.offsetX;
		y=event.offsetY;
		if (x>=0 && x<=255 && y>=0 && y<=255)  {
		SoftMoon.WebWare.rgb.stackSettings();
		SoftMoon.WebWare.rgb.huesByDegrees=false;
		SoftMoon.WebWare.rgb.valuesAsPercent=false;
			Color={
				RGB: SoftMoon.WebWare.rgb.from[mode.toLowerCase()]([(focalHue/_['Π×2'])*360+'°', y=1-y/255, x=x/255]),
				model: mode };
			Color[mode]=new SoftMoon.WebWare.ColorWheelColor(focalHue/_['Π×2'], y, x, mode, false);
		SoftMoon.WebWare.rgb.popSettings();
			return Color;  }  }
	return null;  }


SoftMoon.WebWare.YinYangNiHong.handleMouse=function()  {
	if (Color && Color.focal)  {
		mainCanvas.style.display='none';
		swatchHue=Color[Color.model].hue;
		SoftMoon.WebWare.YinYangNiHong.buildHueSwatches();  }
	else  {
		mainCanvas.style.display='block';
		swatchHue=focalHue/_['Π×2'];
		SoftMoon.WebWare.YinYangNiHong.buildHueSwatches();  }  }


SoftMoon.WebWare.YinYangNiHong.handleClick=function()  { if (Color && Color.focal)  {
	focalHue=Color.focal;
	SoftMoon.WebWare.YinYangNiHong.buildPalette();  }  }


SoftMoon.WebWare.YinYangNiHong.animate=function(event)  {
	if (event.classes[0] !== MasterColorPicker.classNames.activePicker)  return;
	if (event.flag)  {
		if (typeof SoftMoon.WebWare.YinYangNiHong.animate.interval != 'number')
			SoftMoon.WebWare.YinYangNiHong.animate.interval=setInterval(
				function() {if ((aniOffset+=1/44) > 1)  aniOffset=0;  SoftMoon.WebWare.YinYangNiHong.buildHueSwatches();},
				47 );  }
	else  {
		clearInterval(SoftMoon.WebWare.YinYangNiHong.animate.interval);
		SoftMoon.WebWare.YinYangNiHong.animate.interval=null;  }  }


with (SoftMoon.WebWare)  { // UniDOM may be global or a property of SoftMoon.WebWare
UniDOM.addEventHandler( window, 'onload', function()  {
	var picker=document.getElementById('YinYangNíHóng');
		//first we set the private global members
	settings=UniDOM.getElementsByName(picker, 'YinYang NíHóng');

	for (var i=0; i<settings.length; i++)  {
		UniDOM.addEventHandler(settings[i], 'onchange', SoftMoon.WebWare.YinYangNiHong.buildPalette);  }

	SoftMoon.WebWare.YinYangNiHong.buildBasePalette();
	SoftMoon.WebWare.YinYangNiHong.buildHueSwatches();
	SoftMoon.WebWare.YinYangNiHong.buildPalette();
	var cnvsWrap=document.getElementById('YinYangNíHóng').getElementsByTagName('canvas')[0].parentNode,
			passArgs={
		doUse:  function(Color)  {return Color;},
		getColor:  YinYangNiHong.getColor,
		txtInd:  document.getElementById('YinYangNíHóng_indicator'),
		swatch:  document.getElementById('YinYangNíHóng_swatch'),
		noClrTxt: String.fromCharCode(160) };
	UniDOM.addEventHandler(cnvsWrap, ['onMouseMove', 'onMouseOut'], [x_ColorPicker.handleMouse, YinYangNiHong.handleMouse], false, passArgs);  // ← both events call both handlers
	UniDOM.addEventHandler(cnvsWrap, 'onclick', [x_ColorPicker.handleClick, YinYangNiHong.handleClick], false, passArgs);  // ←  ↑  note that multiple handlers are called in order
	UniDOM.addEventHandler(picker, 'onPickerStateChange',  YinYangNiHong.animate);
		} );  }

}());
/*==================================================================*/




// sinebow based on:
// makeColorGradient thanks to:  http://www.krazydad.com/makecolors.php
SoftMoon.WebWare.sinebow=function(settings, phase, callback)  { var freq=2*Math.PI/settings.hue_variety;
	for (var i = 0; i < settings.hue_variety; ++i)  { callback(
		Math.max(0, Math.min(255, Math.sin((2-settings.red_f)*i*freq + settings.red_s + phase.r) * settings.red_v + settings.red_i)),
		Math.max(0, Math.min(255, Math.sin((2-settings.grn_f)*i*freq + settings.grn_s + phase.g) * settings.grn_v + settings.grn_i)),
		Math.max(0, Math.min(255, Math.sin((2-settings.blu_f)*i*freq + settings.blu_s + phase.b) * settings.blu_v + settings.blu_i)) );  }  }  ;

;(function() {  // wrap private members of buildSpectralPalette
var spectral,
		handleClick=function(event) {SoftMoon.WebWare.x_ColorPicker.handleClick(event, x_PickerOpts);},
		handleMouse=function(event) {SoftMoon.WebWare.x_ColorPicker.handleMouse(event, x_PickerOpts);},
		x_PickerOpts={
				doUse:  function(Color) {return Color;},
				getColor:  function(event) {return {RGB: SoftMoon.WebWare.rgb((event.target || event.srcElement).title), model: 'RGB'};},
				txtInd:  document.getElementById('SpectralIndicator'),
				swatch:  document.getElementById('SpectralSwatch'),
				noClrTxt: String.fromCharCode(160)  };

with (SoftMoon.WebWare)  { // “sinebow” below, “UniDOM” may be global or a property of SoftMoon.WebWare
UniDOM.addEventHandler(window, 'onload', function()  {
	spectral=document.getElementById('Spectral');
	buildSpectralPalette();  });


SoftMoon.WebWare.buildSpectralPalette=function()  {  //alert('building');
	var settings=new Object,  board,
			MSIE=navigator.userAgent.match( /MSIE/i ),
			palette=spectral.getElementsByTagName('tbody')[1];
	if (MSIE)  {   //    ↓ generally ignored
		var tWidth=spectral.offsetWidth  ||  parseInt(getComputedStyle(spectral).width);
		 // fix MS Internet Exploder’s lameness - it will not recognize <input type='range' /> tags when using the native getElementsByTagName() method
		board=UniDOM.getElements(spectral.getElementsByTagName('thead')[0], function(e) {return e.nodeName==='INPUT';});  }
	else  board=spectral.getElementsByTagName('thead')[0].getElementsByTagName('input');
	for (i=0; i<board.length; i++)  {
		if ( board[i].getAttribute('type')==='range'  ||  board[i].checked )   settings[board[i].name]=parseFloat(board[i].value);  }  /*
			switch (typeof board[i].value)  {
			case 'string':  {settings[board[i].name]=parseFloat(board[i].value);   break;}      // alert('string' +'\n'+ board[i].name +'\n'+ settings[board[i].name] );
			case 'number':  {settings[board[i].name]=board[i].value;   break;}  }  }          // alert('number' +'\n'+ board[i].name +'\n'+ settings[board[i].name] );      */
	settings.phase_shift=9.42-settings.phase_shift-Math.PI;
	settings.x_shift=6.28-settings.x_shift;
	settings.red_c-=1;  settings.grn_c-=1;  settings.blu_c-=1;
	var yShift=settings.y_shift*settings.mix_variety*3,
			phase, phaseOff, i, tr, tbody=document.createElement('tbody');
	for (i=yShift; i<yShift+settings.mix_variety*3; i++)  {
		phase=((2*Math.PI/3)/settings.mix_variety)*i;
		phaseOff=settings.phase_shift*((settings.mix_variety-i)/settings.mix_variety) + settings.x_shift;
		tr=document.createElement('tr');
		sinebow(settings,
			{r:phase*settings.red_c + phaseOff, g:phase*settings.grn_c + phaseOff, b:phase*settings.blu_c + phaseOff},
			function(r,g,b) { var clr='#'+SoftMoon.WebWare.rgb.to.hex([r,g,b]), td;
				td=document.createElement('td');
				td.title=clr;  td.style.backgroundColor=clr;
				if (MSIE && tWidth!==NaN)  td.style.width=Math.floor(tWidth/settings.hue_variety)+"px";  //if using MSIE you should use CSS to set an absolute width for the Spectral parent table
				tr.appendChild(td);
				td.onclick=handleClick;
				td.onmouseover=handleMouse;
				td.onmouseout=handleMouse;  } );
		tbody.appendChild(tr);  }
	spectral.replaceChild(tbody, palette);
	spectral.getElementsByTagName('thead')[0].getElementsByTagName('td')[0].colSpan=""+settings.hue_variety;
	spectral.getElementsByTagName('thead')[0].getElementsByTagName('td')[0].setAttribute('colspan', ""+settings.hue_variety);
	}
}  // close “with (SoftMoon.WebWare)”
})();  //close & execute the anonymous wrapper function holding long-term private variables




/*==================================================================*/

/*
SoftMoon.WebWare.initPaletteTables= function(path, whenLoaded, whenDone)  { with (SoftMoon.WebWare)  {
	var loaded_palettes=new Array,
			files=loadPalettes( path,
													function()  {
														var json_palette=addPalette(this.responseText);
														loaded_palettes.push(json_palette);  },
													null,  //load errors are silently ignored
													HTTP.handleMultiple );

	var wait=setInterval(
		function()  { var i, flag=false, html="", alrtBox=document.getElementById('paletteLoadingAlert');
			if (files.length)  for (i=0; i<files.length; i++)  { html+=files[i].url;
				if (files[i].trying)  {html+="\n";  flag=true;}
				else  html+=((files[i].status===200)  ? initPaletteTables.loadedHTML : initPaletteTables.failedHTML)+"\n";  }
			else  flag=(files instanceof Array);
			alrtBox.lastChild.innerHTML= html;
			if (flag)  return;
			clearInterval(wait);
			var paletteName,  wrap=document.getElementById('MasterColorPicker_mainPanel');
			for (i=0; i<loaded_palettes.length; i++)  { for (paletteName in loaded_palettes[i])  {
				if (typeof whenLoaded == 'function'  &&  whenLoaded(paletteName))  continue;
				wrap.appendChild( (typeof loaded_palettes[i][paletteName].buildPaletteHTML == 'function')  ?
							loaded_palettes[i][paletteName].buildPaletteHTML(paletteName)       // ← ↓ init
						: buildPaletteTable(paletteName, loaded_palettes[i][paletteName], 'color_chart picker') ).setStylez();
				var slct=document.getElementById('palette_select'), o;
				o=document.createElement('option');
				o.appendChild(document.createTextNode(paletteName));
				o.selected=(SoftMoon._POST.palette===paletteName);
				slct.appendChild(o);  }  }
//			flag=document.getElementById('palette_show').getElementsByTagName('input');
//			for (i=0; i<flag.length; i++)  {flag[i].onclick();}
			if (typeof whenDone == 'function')  whenDone(files);
			alrtBox.style.display='none';
			wrap.className=wrap.className.replace( /init/ , "");  },
		500 );  }  }
*/

//   If you don’t supply a  path  then the loadPalettes() function will use
// its default path to the palettes’ folder on the server.
//   If you supply a  whenLoaded  function, it will be passed the freshly loaded palette name
// before each palette <table> HTML is built.  If this function passes back  true  then the HTML <table>
// will NOT be built, nor will it be added to the “palette select”; it will be then assumed that this
// function (the whenLoaded function) handled all that if required.
//   If you supply a  whenDone  function, it will be passed an array of
// HTTP-connect Objects (their connections completed) (see the comments for the loadPalettes() function in the rgb.js file)
// after all the palette files are loaded and their HTML <table>s are built, just before their display is set to none.
// (remember, for JavaScript to set inline styles, the element must be currently displayed)
SoftMoon.WebWare.initPaletteTables= function(path, whenLoaded, whenDone)  { with (SoftMoon.WebWare)  {
	var wrap=document.getElementById('MasterColorPicker_mainPanel');
	if (path instanceof Array)  {
		for (var i=0;  i<path.length;  i++)  {addPalette(path[i]);  initLoadedPaletteTable(path[i], whenLoaded);}
		UniDOM.removeClassName(wrap, 'init');
		return;  }

	var files=loadPalettes( path,
													function()  {
														var json_palette=addPalette(this.responseText);
														initLoadedPaletteTable(json_palette, whenLoaded)  },
													null,  //load errors are silently ignored
													HTTP.handleMultiple );

	var wait=setInterval(
		function()  {
			var i, flag=false, html="",
			alrtBox=document.getElementById('paletteLoadingAlert');
			if (files.length)  for (i=0; i<files.length; i++)  { html+=files[i].url;
				if (files[i].trying)  {html+="\n";  flag=true;}
				else  html+=((files[i].status===200)  ? initPaletteTables.loadedHTML : initPaletteTables.failedHTML)+"\n";  }
			else  flag=(files instanceof Array);
			alrtBox.lastChild.innerHTML= html;
			if (flag)  return;
			clearInterval(wait);
			if (typeof whenDone == 'function')  whenDone(files);
			alrtBox.style.display='none';
			UniDOM.removeClassName(wrap, 'init');  },
		500 );  }  }
SoftMoon.WebWare.initPaletteTables.loadedHTML=" <span class='loaded'>¡Loaded!</span>";
SoftMoon.WebWare.initPaletteTables.failedHTML=" <span class='failed'>¡Failed to Load!</span>";


SoftMoon.WebWare.initLoadedPaletteTable=function(json_palette, whenLoaded)  {
	var paletteName,  o,
			slct=document.getElementById('palette_select'),
			wrap=document.getElementById('MasterColorPicker_mainPanel');
	for (paletteName in json_palette)  {
		if (typeof whenLoaded == 'function'  &&  whenLoaded(paletteName))  continue;
		wrap.appendChild( (typeof json_palette[paletteName].buildPaletteHTML == 'function')  ?
					json_palette[paletteName].buildPaletteHTML(paletteName)       // ← ↓ init
				: SoftMoon.WebWare.buildPaletteTable(paletteName, json_palette[paletteName], 'color_chart picker') ).setStylez();
		o=document.createElement('option');
		o.appendChild(document.createTextNode(paletteName));
		o.selected=(SoftMoon._POST  &&  SoftMoon._POST.palette===paletteName);
		slct.appendChild(o);  }  };


;(function() {
var setStylez=function()  { var elmnts=this.childNodes, i, s;  // note how we can set inline styles for the Spectral palette, but that does not work for these…
			for (i=0; i<elmnts.length; i++)  { if (elmnts[i].nodeType==Node.ELEMENT_NODE)  {
				if (elmnts[i].stylez)  for (s in elmnts[i].stylez)  {elmnts[i].style[s]=elmnts[i].stylez[s];}
				if (elmnts[i].hasChildNodes())  arguments.callee.call(elmnts[i]);  }  }  } ,
		douseColor=function(Color) {return Color;} ,
		addEntry=function(event)  {
			var txt=this.chain+(event.target || event.srcElement).firstChild.data;
			return  {RGB: SoftMoon.WebWare.rgb(txt),  text: txt,  model: 'text'};  } ,
		returnNext=function(event)  {
			var target=(event.target || event.srcElement).nextSibling;
			return target.onclick({target: target});  } ,
		addRef=function(event)  {
			var txt=(event.target || event.srcElement).firstChild.data;
			return  {RGB: SoftMoon.WebWare.rgb(txt),  text: txt,  model: 'text'};} ,
		addBackRef=function(event)  {
			var txt=(event.target || event.srcElement).firstChild.firstChild.data;
			return  {RGB: SoftMoon.WebWare.rgb(txt),  text: txt,  model: 'text'};} ,
		handleClick=function(event) {SoftMoon.WebWare.x_ColorPicker.handleClick(event, this.x_PickerOpts);} ;


/*
		addRef=function() {MasterColorPicker.pick(this.firstChild.data);  return false;} ,
		addBackRef=function() {MasterColorPicker.pick(this.firstChild.firstChild.data);  return false;} ,
		column={hex:3, RGB:4, HSV:5},
		hideFormat=function(format, doso)  {
			var CSS=SoftMoon.WebWare.buildPaletteTable.relatedStylesheet,
					selector='table.color_chart td:nth-child('+column[format]+')',
					pos=CSS.getRuleIndexes(selector);
			if (doso  ||  typeof doso == 'undefined')  {
				if (pos)  for (var i=0; i<pos.length; i++)  {if (pos[i]>=CSS.initLength)  return;}
				CSS.insertRule(selector, 'display: none;');  }
			else
			if (pos)  for (var i=0; i<pos.length; i++)  { if (pos[i]>=CSS.initLength)
				CSS.deleteRule(pos[i]);  }  } ,
		refactor=function(format)  { var trs=this.getElementsByTagName('tr'), i;
			for (i=0; i<trs.length; i++)  { if (trs[i].childNodes.length >1  &&  trs[i].className !== 'noColor')
				with (SoftMoon.WebWare)  {
				switch (format)  {
				case 'RGB': trs[i].childNodes[column[format]-1].firstChild.data=
						rgb(trs[i].childNodes[column['hex']-1].firstChild.data).toString('wrapped');
					break;
				case 'HSV': trs[i].childNodes[column[format]-1].firstChild.data=
						rgb.to.hsv(rgb(trs[i].childNodes[column['hex']-1].firstChild.data).rgb).toString();
					break;  }  }  }  } ;
*/

SoftMoon.WebWare.buildPaletteTable= function(pName, pData, className)  {
	var tbl, cpt;
	tbl=document.createElement('table')
	tbl.className=className  // 'color_chart'
	tbl.id=pName
	cpt=document.createElement('caption')
	cpt.innerHTML= pData.caption  ||  SoftMoon.WebWare.buildPaletteTable.caption.replace( /{pName}/ , pName);
	tbl.appendChild(cpt);
	if (pData.header)  tbl.appendChild(buildTableHdFt(pData.header, 'thead', 'th'));
	tbl.appendChild(buildTableRow('td', [
			{stylez:{border: '2px dotted'}, onclick: handleClick,
				x_PickerOpts: {
					doUse:  douseColor,
					getColor: returnNext}  },
			{text:'none', onclick: handleClick,
				x_PickerOpts: {
					doUse:  douseColor,
					getColor:addRef}  },
//			{text:'—', onclick:addRef},
//			{text:'—', onclick:addRef},
//			{text:'—', onclick:addRef}
			],
		'noColor'));
	tbl.appendChild(buildTableBody(pData.palette));
	if (pData.footer)  tbl.appendChild(buildTableHdFt(pData.footer, 'tfoot', 'td'));
	tbl.setStylez=setStylez;
//	tbl.hideFormat=hideFormat;
//	tbl.refactor=refactor;
//	tbl.rebuild=function() {SoftMoon.WebWare.buildPaletteTable(pName, pData, className);}
	return tbl;

function buildTableHdFt(data, t, clmn)  {
	if (!(data instanceof Array))  data=[data];
	var hdft=document.createElement(t);
	for (var i=0; i<data.length; i++)  {hdft.appendChild( buildTableRow(clmn, [{colSpan:'2', text:data[i] }]) );}
	return hdft;  }

function buildTableBody(colors, chain)  { if (typeof chain != 'string')  chain="";
	var flag=false, tb, tr, th, subs=new Object, subIndex, clr, frag=document.createDocumentFragment(),
			flagBackRef, flagFwdRef, refColorMarks=SoftMoon.WebWare.buildPaletteTable.refColorMarks;
	for (var c in colors)  {
		if (colors[c].palette)  {subs[c]=colors[c].palette;  continue;}
		if (c.match( /[a-z]/ )  &&  !c.match( /[A-Z]/ ))  continue;  // color names that are in all-lowercase are alternative spellings and are not displayed
		if ((clr=SoftMoon.WebWare.rgb(colors[c])) == null)  continue;
		if (!flag)  {flag=true;  tb=document.createElement('tbody');}
		flagBackRef=(typeof colors[c] == 'string'  &&  ( colors[c].match( /^\s/ )
			||  (colors[c].substr(refColorMarks[0].length)===refColorMarks[0]  &&  colors[c].substr(-refColorMarks[1].length)===refColorMarks[1]) ));
		flagFwdRef=(typeof c == 'string'  &&  ( c.match( /^\s/ )
			||  (c.substr(refColorMarks[0].length)===refColorMarks[0]  &&  c.substr(-refColorMarks[1].length)===refColorMarks[1]) ));
		tb.appendChild(buildTableRow('td', [

			{ text: flagBackRef ?  ('<div>'+colors[c]+'</div>')  :  "",
				stylez: {backgroundColor: clr.hex, color: clr.contrast},
				onclick: handleClick,
				x_PickerOpts: {
					doUse:  douseColor,
					getColor: (flagBackRef ?  addBackRef :  returnNext) }  },
			{ text: flagFwdRef ? colors[c] : c,
				onclick: handleClick,
				x_PickerOpts: {
					doUse:  douseColor,
					getColor: (flagFwdRef ?  addRef : addEntry),
					chain: buildHierarchy(
						((pName===SoftMoon.defaultPalette) ? "" : pName),
						((pData.requireSubindex==='false') ? "" : chain) ) } },
/*
			{ text: flagBackRef ?  ('<div>'+colors[c]+'</div>')  :  "",
				stylez: {backgroundColor: clr.hex, color: clr.contrast},
				onclick: flagBackRef ?  addBackRef
														 :  returnNext },
			{ text: flagFwdRef ? colors[c] : c,
				onclick: flagFwdRef ?  addRef
														:  function() { MasterColorPicker.pick( this.firstChild.data,
					((this.parentNode.parentNode.parentNode.id===SoftMoon.defaultPalette) ? "" : this.parentNode.parentNode.parentNode.id),
					((pData.requireSubindex==='false') ? "" : chain) );  return false;  }  },
*/
//			{text:clr.hex, onclick:addRef},
//			{text:clr.toString('wrapped'), onclick:addRef },
//			{text:SoftMoon.WebWare.rgb.to.hsl(clr.rgb).toString(), onclick:addRef}
			]));
		}
	if (flag)  frag.appendChild(tb);
	for (s in subs)  { subIndex=(chain.length>0 ? (chain+': ') : "")+s
		frag.appendChild(buildTableRow('th', [{colSpan:'2', text:subIndex}]));
		frag.appendChild(buildTableBody(subs[s], subIndex));  }
	return frag;  }

function buildHierarchy()  { var chosen="";
	if (arguments.length>0)  {
		if (arguments[0] instanceof Array)
			chosen=arguments[0].join(': ')+': '+chosen;
		else  for (var i=arguments.length; --i>=0;)  { if (typeof arguments[i] == 'string'  &&  arguments[i].length>0)
			chosen=arguments[i]+': '+chosen;  }  };
 return chosen;
}

function buildTableRow(chlds, data, className)  {
	var i, o, tr=document.createElement('tr'), td;
	tr.className=className;
	for (i in data)  { td=document.createElement(chlds); // td ‖ th
		for (o in data[i])  {
			if (o==='text')  td.innerHTML=data[i].text;
			else  td[o]=data[i][o];  }
		tr.appendChild(td);  }
	return tr;  }

 }; //close  SoftMoon.WebWare.buildPaletteTable
})();  //close & execute the anonymous wrapper function holding long-term private variables


SoftMoon.WebWare.buildPaletteTable.caption='<h6><strong>{pName}</strong> color-picker table</h6>click to choose';  //  '{pName} colors'
SoftMoon.WebWare.buildPaletteTable.refColorMarks=[ '«' , '»' ];  // if a color name in a palette is wrapped
		// with these characters, it is a “forward-reference” to the color-definition.  This means that when the
		// HTML palette <table> is being built, the color-name is not listed, rather the color-definition is listed.
		// Fowward referencing can also be accompliched by placing white-space at the beginning of the color-name.
		// Back-referencing the color-definition can be accompliched in a similar way, by wrapping the color-definition
		// with these characters, or by placing white-space at the beginning of the color-definition;
		// in this case, the color-name will be listed, but the color-definition-text will be
		// placed inside a <div></div> within the color-swatch <td></td> (the first column of the row which is usually textless).
		// Use CSS to manage this added <div>, noting its parent color-swatch <td></td> background will be set as usual,
		// but the <td></td> forground will also be set to a contrasting color.


// =================================================================================================== \\







//the Picker Class is generic; the pickFilter is for our color-picker application
var MasterColorPicker=new SoftMoon.WebWare.Picker(
	document.getElementById('MasterColorPicker_mainPanel'),
	{ picker_select: document.getElementById('palette_select'),
		pickFilters: [SoftMoon.WebWare.x_ColorPicker.pickFilter] } );  // ← the pickFilter filters the “picked” text and
			// handles any other chores before MasterColorPicker.pick() adds the text
			//   to the active MasterColorPicker.dataTarget.value

//these are options for the pickFilter function and it’s related colorSwatch function
MasterColorPicker.useHash=true;  // ¿prefix hex values with a hash like this: #FF0099 ?
MasterColorPicker.useRGB =true;  // ¿wrap rgb values like this: rgb(255, 0, 153) ?
MasterColorPicker.useCMYK=true;  // ¿wrap cmyk values ?
//we tell the pickFilter to use it’s related colorSwatch function, but we can also use it by calling it directly:
MasterColorPicker.colorSwatch=SoftMoon.WebWare.x_ColorPicker.colorSwatch;
MasterColorPicker.showColorAs='swatch';   //  'swatch'  or  'background'←of the element passed into colorSwatch()←MasterColorPicker.dataTarget
MasterColorPicker.swatch=false;  // no universal swatch element provided, so colorSwatch() will figure it from the dataTarget ↑.
MasterColorPicker.toggleBorder=true;      // of the swatch when it has a valid color
MasterColorPicker.borderColor='invert';  // HTML/CSS color  or  'invert'

//any interface element that requires “focus” needs to be registered to work properly
MasterColorPicker.registerInterfaceElement(document.getElementById('palette_select'), {tabToTarget: true});

//likewise, any document subsection that is not part of the picker mainPanel, but is part of the picker interface and
//therefore may require “clicking on” or have elements that require “focus”, needs to be registered to work properly
MasterColorPicker.registerInterfacePanel(document.getElementById('MasterColorPicker_options'));


with (SoftMoon.WebWare)  { //UniDOM may be global or a property of SoftMoon.WebWare

UniDOM.addEventHandler(document.getElementById('MasterColorPicker_options'), 'onPickerStateChange',
	function(event)  {
		document.getElementById("palette_mode").disabled=!event.flag;
		document.getElementById('keepPrecision').disabled=!event.flag;  },
	false);

UniDOM.generateEvent(document.getElementById('MasterColorPicker_options'), 'onPickerStateChange', {canBubble: false, userArgs: {flag:false}});


UniDOM.addEventHandler(document.getElementById("palette_select"), 'onchange', function()  {
	MasterColorPicker.choosePicker(MasterColorPicker.classNames.activePicker, null, MasterColorPicker.pickerActiveFlag);
	MasterColorPicker.choosePicker(MasterColorPicker.classNames.activePickerInterface, null, MasterColorPicker.interfaceActiveFlag);
	var pMode=document.getElementById("palette_mode"),
			palette=this.options[this.selectedIndex].text,
			disabledFor, flag;
		pMode.parentNode.parentNode.firstChild.firstChild.data=palette + ' mode:';
		disabledFor={
			//These are the available native modes, but we will now allow canverting from native→ through RGB→ to any user’s choice.
			//This may allow native → RGB → native and may introduce minor roundoff errors in the process, especially dependent on whether “keep precision” is checked/true.
			//But it allows the user to keep their chosen format (while switching between pickers) regardless of the current picker being used.
//				"Spectral": 'native',    // ← reverts to RGB, yet title-attribute popups show hex…
//				"RainbowMaestro": 'hcg',
//				"BeezEye": 'hsv hsl hcg cmyk',
//				"Simple²": 'hsv hsl hcg',
//				"YinYangNíHóng": 'hsv hsl hcg',
			};
		for (var i=2; i<pMode.options.length; i++)  {
			flag1=(disabledFor[palette]  &&  disabledFor[palette].match( pMode.options[i].text.toLowerCase().replace( /\s/ , "" ) ));
			pMode.options[i].disabled=flag1;
			pMode.options[i].style.display= flag1 ? 'none' : "";  }  }  );


SoftMoon.WebWare.rgb.keepPrecision=document.getElementById('keepPrecision').checked;


UniDOM.addEventHandler(window, 'onload', function()  {
	var getInputs=function()  {
		var i, mc=new Array, inps=document.getElementsByTagName('input');
		for (i=0; i<inps.length; i++)  {
			if (inps[i].getAttribute('type').toLowerCase() === 'mastercolorpicker'
			||  (inps[i].getAttribute('pickerType') && inps[i].getAttribute('pickerType').toLowerCase() === 'mastercolorpicker'))
				mc.push(inps[i]);  }
		return mc;  }

	var i, inps=getInputs(),            // ↓ wait for paste to change the value
			onChng=function() {var e=this;  setTimeout(function() {MasterColorPicker.colorSwatch(e);}, 0);};

	for (i=0; i<inps.length; i++)  {
		MasterColorPicker.registerTargetElement(inps[i]);
		UniDOM.addEventHandler(inps[i], ['onkeyup', 'onpaste', 'onchange'], onChng);  }  } );

}  //close  with (SoftMoon.WebWare)
