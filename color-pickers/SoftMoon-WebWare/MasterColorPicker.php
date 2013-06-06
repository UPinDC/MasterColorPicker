<!--  MasterColorPicker  Copyright © 2012, 2013 Joe Golembieski, SoftMoon-WebWare
      release 1.0.4  June 3, 2013
	Note that these color charts and palettes will work without an enclosing <form>,
but to retain the settings this file may be included inside an existing web <form></form>
-->

<!--  You may move these support scripts to the document head, especially if you plan on using them with other code  -->
<script type='text/javascript' src='JS_toolbucket/UniDOM.js'></script>
<script type='text/javascript' src='JS_toolbucket/HTTP.js'></script><!-- for server version, not for desktop use -->
<!--  script type='text/javascript' src='JS_toolbucket/Log.js'></script><!--  only if you plan on logging to debug -->
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/rgb.js'></script>
<script type='text/javascript' src='JS_toolbucket/SoftMoon-WebWare/Picker.js'></script>
<script type="text/javascript" src="color-pickers/Rigden_colorblind-convert_table.js"></script>

<!--  div id='MasterColorPicker_debugLog'></div>
<button onclick="MasterColorPicker.debug.log.clear();" style='position: relative; z-index: 10000'>Clear Log</button  -->


<section id='MasterColorPicker_options' class='pickerPanel'>
<header><h1>MasterColorPicker™</h1> by <address>SoftMoon-WebWare</address></header>

<label>palette: <select id='palette_select' name='palette'>
<option<?php if ($_POST['palette']==='RainbowMaestro'  or  $_POST['palette']=="")  echo " selected='selected'"?>>RainbowMaestro</option>
<option<?php if ($_POST['palette']==='Spectral')  echo " selected='selected'"?>>Spectral</option>
<option<?php if ($_POST['palette']==='BeezEye')  echo " selected='selected'"?>>BeezEye</option>
<option<?php if ($_POST['palette']==='Simple²')  echo " selected='selected'"?>>Simple²</option>
<option<?php if ($_POST['palette']==='YinYang NíHóng')  echo " selected='selected'"?>>YinYang NíHóng</option>
</select></label>
<script type="text/javascript">//<![CDATA[  capture the sent palette name in case it was a color-names-table - these are built dynamically using JavaScript with data from HTTP
	if (typeof SoftMoon._POST != 'object')  SoftMoon._POST=new Object;
	<?php if ($_POST['palette']) echo 'SoftMoon._POST.palette="',$_POST['palette'],'"'; ?>
//]]></script>

<div>Options▼
<div>
<fieldset><legend><?php echo $_POST['palette_select'] ? $_POST['palette_select'] : 'RainbowMaestro';  ?> mode:</legend>
<label>output<select id='palette_mode' name='palette_mode' onchange='SoftMoon.WebWare.buildSpectralPalette()'>
	<option<?php if (!in_array($_POST['palette_mode'], array('RGB', 'native', 'HSV', 'HSL', 'HCG', 'CMYK'), true))  echo " selected='selected'"; ?>>hex</option>
	<option<?php if ($_POST['palette_mode']==='RGB')  echo " selected='selected'"; ?> title='Red, Green, Blue'>RGB</option>
	<option<?php if ($_POST['palette_mode']==='native')  echo " selected='selected'"; ?>>native</option>
	<option<?php if ($_POST['palette_mode']==='HSV')  echo " selected='selected'"; ?>>HSB</option>
	<option<?php if ($_POST['palette_mode']==='HSL')  echo " selected='selected'"; ?>>HSL</option>
	<option<?php if ($_POST['palette_mode']==='HCG')  echo " selected='selected'"; ?>>HCG</option>
	<option<?php if ($_POST['palette_mode']==='CMYK')  echo " selected='selected'"; ?>>CMYK</option>
</select></label>
<label>¿<input type='checkbox' id='keepPrecision' name='keepPrecision' value='true' <?php
	if ($_POST['keepPrecision']=='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>
	onchange='SoftMoon.WebWare.rgb.keepPrecision=this.checked;' />keep precision?
	<p>Hex and RGB values are calculated from the native format, and others are calculated from the RGB values.&nbsp;
			RGB values may be rounded off to integers in the process yielding differences that are especially noticeable in Hue values.&nbsp;
			(More minor round off errors will always be possible due to floating-point mathematics used by computers.)&nbsp;
			Note RGB values will always be shown as integers, and are always used internally by the computer’s hardware
			as integers, so by <strong>not</strong> keeping precision, resulting conversions from the RGB values reflect
			the “used RGB” values.</p></label>
</fieldset>
<label>¿<input type='checkbox' name='RGB_autoconvert' id='RGB_autoconvert' value='true' <?php
		if ($_POST['RGB_autoconvert']==='true'  or  !isset($_POST['palette_select']))  echo 'checked="checked" '; ?>/>auto-convert?
	<span> Clicking a choice below can auto-convert your selected colors to the chosen color-space-model format.</span></label>
<fieldset id='RGB_by'><legend>Enter <acronym>RGB</acronym> color-space values as:</legend>
	<label><input type='radio' name='RGB_by' value='byte' onclick='SoftMoon.WebWare.rgb.valuesAsByte= this.checked' <?php
		if ($_POST['RGB_by']!=='factor')  echo 'checked="checked" '; ?>/>Byte value (integer 0—255)</label>
	<label><input type='radio' name='RGB_by' value='factor' onclick='SoftMoon.WebWare.rgb.valuesAsByte= !this.checked' <?php
		if ($_POST['RGB_by']==='factor')  echo 'checked="checked" '; ?>/>Percent or Factor</label>
</fieldset>
<fieldset id='RGB_convertFrom'><legend>Enter color-space values as:</legend>
	<label><input type='radio' name='RGB_convertFrom' value='percent' onclick='SoftMoon.WebWare.rgb.valuesAsPercent= this.checked' <?php
		if ($_POST['RGB_convertFrom']!=='factor')  echo 'checked="checked" '; ?>/>Percent (0.0%—100.0%)</label>
	<label><input type='radio' name='RGB_convertFrom' value='factor' onclick='SoftMoon.WebWare.rgb.valuesAsPercent= !this.checked' <?php
		if ($_POST['RGB_convertFrom']==='factor')  echo 'checked="checked" '; ?>/>Factor (0.0—1.0)</label>
</fieldset>
<fieldset id='RGB_convertHue'><legend>Enter Hue values as:</legend>
	<label><input type='radio' name='RGB_convertHue' value='degrees' onclick='SoftMoon.WebWare.rgb.huesByDegrees= this.checked' <?php
		if ($_POST['RGB_convertHue']!=='factor')  echo 'checked="checked" '; ?>/>Degrees (0.0°—360.0°)</label>
	<label><input type='radio' name='RGB_convertHue' value='factor' onclick='SoftMoon.WebWare.rgb.huesByDegrees= !this.checked' <?php
		if ($_POST['RGB_convertHue']==='factor')  echo 'checked="checked" '; ?>/>Percent or Factor</label>
</fieldset>
<ul id='bull'>
<li> all <acronym>RGB</acronym> values entered between <span>0–0.999…</span> when the default mode is “byte” will be considered factors.</li>
<li> percent values may be forced using values <span>0.0%–100.0%</span> entered with a trailing “percent” sign.</li>
<li> hue values may be forced to degrees using values <span>0.0°–360.0°</span> entered with a trailing “degrees” sign or by using the three letters “deg”.</li>
</ul>
</div></div>

</section><!--  close  MasterColorPicker_options  -->


<section id='MasterColorPicker_mainPanel' class='pickerPanel init'><!--  class “init” is removed after the color-tables are generated - they need to be shown while this process occurs  -->

<table class='picker palette' id='Spectral'><caption><h6>Spectral Progressive Color-Picker™</h6>click to choose<span id='SpectralIndicator'>&nbsp;<span id='SpectralSwatch'></span></span></caption>

<thead><tr><td colspan='100'><table>
<tr>
	<td colspan='6'><label>hue variety: <input type='range' name='hue_variety' value='<?php echo is_numeric($_POST['hue_variety']) ? $_POST['hue_variety'] : "30";?>' max='100' min='10' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label>
									<label>mix variety: <input type='range' name='mix_variety' value='<?php echo is_numeric($_POST['mix_variety']) ? $_POST['mix_variety'] : "7";?>' max='20' min='5' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label><br />
									<label>x-shift: <input type='range' name='x_shift' value='<?php echo is_numeric($_POST['x_shift']) ? $_POST['x_shift'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label>
									<label>y-shift: <input type='range' name='y_shift' value='<?php echo is_numeric($_POST['y_shift']) ? $_POST['y_shift'] : "0";?>' max='1' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label>
									<label>mix shift: <input type='range' name='phase_shift' value='<?php echo is_numeric($_POST['phase_shift']) ? $_POST['phase_shift'] : "4.71";?>' max='9.42' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></label></td><!-- Opera limits the number of digits in the value,min,max fields  -->
</tr>
<tr><th></th><th>channel</th><th>intensity</th><th>variation</th><th>shift</th><th>frequency</th></tr>
<tr style='color:red'><td>RED</td>
	<td>
		<input type='radio' name='red_c' value='1'<?php if ($_POST['red_c']==='1'  or  ($_POST['red_c']!=='2'  and  $_POST['red_c']!=='3'))  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='red_c' value='2'<?php if ($_POST['red_c']==='2')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='red_c' value='3'<?php if ($_POST['red_c']==='3')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
	</td>
	<td><input type='range' name='red_i' value='<?php echo is_numeric($_POST['red_i']) ? $_POST['red_i'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='red_v' value='<?php echo is_numeric($_POST['red_v']) ? $_POST['red_v'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='red_s' value='<?php echo is_numeric($_POST['red_s']) ? $_POST['red_s'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='red_f' value='<?php echo is_numeric($_POST['red_f']) ? $_POST['red_f'] : "1";?>' max='2' min='0.01' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
</tr>
<tr style='color:lime'><td>GREEN</td>
	<td>
		<input type='radio' name='grn_c' value='1'<?php if ($_POST['grn_c']==='1')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='grn_c' value='2'<?php if ($_POST['grn_c']==='2'  or  ($_POST['grn_c']!=='1'  and  $_POST['grn_c']!=='3'))  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='grn_c' value='3'<?php if ($_POST['grn_c']==='3')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
	</td>
	<td><input type='range' name='grn_i' value='<?php echo is_numeric($_POST['grn_i']) ? $_POST['grn_i'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='grn_v' value='<?php echo is_numeric($_POST['grn_v']) ? $_POST['grn_v'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='grn_s' value='<?php echo is_numeric($_POST['grn_s']) ? $_POST['grn_s'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='grn_f' value='<?php echo is_numeric($_POST['grn_f']) ? $_POST['grn_f'] : "1";?>' max='2' min='0.01' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
</tr>
<tr style='color:#4040FF'><td>BLUE</td>
	<td>
		<input type='radio' name='blu_c' value='1'<?php if ($_POST['blu_c']==='1')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='blu_c' value='2'<?php if ($_POST['blu_c']==='2')  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
		<input type='radio' name='blu_c' value='3'<?php if ($_POST['blu_c']==='3'  or  ($_POST['blu_c']!=='2'  and  $_POST['blu_c']!=='1'))  echo " checked='checked'"; ?> onchange='SoftMoon.WebWare.buildSpectralPalette()' />
	</td>
	<td><input type='range' name='blu_i' value='<?php echo is_numeric($_POST['blu_i']) ? $_POST['blu_i'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='blu_v' value='<?php echo is_numeric($_POST['blu_v']) ? $_POST['blu_v'] : "128";?>' max='255' min='0' step='1' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='blu_s' value='<?php echo is_numeric($_POST['blu_s']) ? $_POST['blu_s'] : "0";?>' max='6.28' min='0' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
	<td><input type='range' name='blu_f' value='<?php echo is_numeric($_POST['blu_f']) ? $_POST['blu_f'] : "1";?>' max='2' min='0.01' step='0.01' onchange='SoftMoon.WebWare.buildSpectralPalette()' /></td>
</tr>
</table></td></tr></thead>

<tbody>
</tbody>
</table>



<table class='picker palette' id='BeezEye'>
<caption><h6>BeezEye Color Picker™</h6>click to choose</caption>
<tbody>
<tr>
	<td><label id="BeezEye_twist_value_transformer" data-fd-slider-rotate="330">Twist<input type='range' name='BeezEye_twist_value' value='50' min='0' mmax='100' data-fd-slider-transformer="BeezEye_twist_value_transformer" /></label></td>
	<td><fieldset><legend>color space</legend>
		<dl>
			<dt>CMYK</dt>
				<dd>Cyan, Magenta, Yellow, Black</dd>
			<dt>HSB / HSV</dt>
				<dd>Hue, Saturation, Brightness a.k.a Value</dd>
			<dt>HSL</dt>
				<dd>Hue, Saturation, Lightness</dd>
			<dt>HCG</dt>
				<dd>Hue, Chroma, Gray</dd>
			<dt>Curve</dt>
				<dd>modulates the saturation rate</dd>
			<dt>Twist</dt>
				<dd>twists the color-disk at its center to make it easier to find progressive color-series</dd>
		</dl>
		<label><input type='radio' name='BeezEye_model' value='cmyk' />CMYK</label>
		<label><input type='radio' name='BeezEye_model' value='hsb' />HSB / HSV</label>
		<label><input type='radio' name='BeezEye_model' value='hsl' checked='checked' />HSL</label>
		<label><input type='radio' name='BeezEye_model' value='hcg' />HCG</label>
		<label>¿<input type='checkbox' name='BeezEye_curve' value='curve' />curve?</label>
		<label>¿<input type='checkbox' name='BeezEye_twist' value='twist' />twist?</label>
		</fieldset>
	</td>
</tr>
<tr>
	<td rowspan='2'><canvas width='360' height='360'></canvas></td>
	<td><label id="BeezEye_value_transformer" data-fd-slider-rotate="270">Brightness <span>Value</span><input type='range' name='BeezEye_value' value='50' min='0' max='100' data-fd-slider-transformer="BeezEye_value_transformer" /></label></td>
</tr>
<tr>
	<td valign='bottom'><fieldset>
		<label id="BeezEye_curve_value_transformer" data-fd-slider-rotate="315">Curve<input type='range' name='BeezEye_curve_value' value='50' min='1' max='100' data-fd-slider-transformer="BeezEye_curve_value_transformer" /></label>
		<label><input type='checkbox' name='BeezEye_curve_midring' value='midring' /> Mid–Ring</label>
		</fieldset>
	</td>
</tr>
<tr>
	<td><label>Hue Variety<input type='range' name='BeezEye_variety' value='15' min='5' max='89' step='2' /></label></td>
	<td rowspan='2' id='BeezEye_swatch'></td>
</tr>
<!--  tr><td><label>Eye size<input type='range' name='BeezEye_size' value='360' min='160' max='720' step='12' /></label></td></tr  -->
<tr><td id='BeezEye_indicator'> </td></tr>
</tbody>
</table>



<table class='picker palette' id='RainbowMaestro'><caption><h6>RainbowMaestro Harmonic Color Picker™</h6>click to choose</caption>
<thead>
	<tr><td colspan='2'>
	<label><input type='checkbox' name='RainbowMaestro_websafe' value='true' checked='checked' />websafe</label>
	<label><input type='checkbox' name='RainbowMaestro_splitComplement' value='true' />split-compliments</label>
	<label><input type='checkbox' name='RainbowMaestro_lock' value='true' />lock focal hue</label>
	<label><input type='checkbox' name='RainbowMaestro_colorblind' value='true' checked='checked' />colorblind assist<mark class='footmark'>‡</mark></label>
	</td></tr>
	<tr><td colspan='2'>
	<label>variety<input type='range' name='RainbowMaestro_variety' value='6' min='6' max='32' /></label>
	<label>¿focals only<input type='checkbox' name='RainbowMaestro_focalsOnly' value='true' />?</label>
	 <input type='hidden' name='RainbowMaestro_focalHue' value='<?php echo ($_POST['RainbowMaestro_focalHue']) ? $_POST['RainbowMaestro_focalHue'] : '0'; /*radians*/ ?>' />
	<label id='RainbowMaestro_hueIndicator'>focal hue:<input type='number' name='RainbowMaestro_focalHue_degrees' value='<?php echo ($_POST['RainbowMaestro_focalHue_degrees']) ? $_POST['RainbowMaestro_focalHue_degrees'] : '0';
	 ?>' min='0' max='360' size='13' maxlength='9' title='Hue given in degrees (0.0°–360.0°).' /><span>&nbsp;</span></label>
	</td></tr>
	<tr><td colspan='2' id='RainbowMaestro_swatch'><span id='RainbowMaestro_indicator'>&nbsp;</span></td><tr>
</thead>
<tbody>
<tr><th>full color</th>
		<th class='colorblind'>Protan simulation<mark class='footmark'>‡</mark></th></tr>
<tr><td><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td>
		<td class='colorblind'><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td></tr>
<tr><th class='colorblind'>Deutan simulation<mark class='footmark'>‡</mark></th>
		<th class='colorblind'>Tritan simulation<mark class='footmark'>‡</mark></th></tr>
<tr><td class='colorblind'><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td>
		<td class='colorblind'><div class='subpalette_swatch'></div><canvas width='360' height='360'></canvas></td></tr>
</tbody>
<tfoot>
	<tr class='colorblind'><td colspan='2'><mark class='footmark'>‡</mark>simulations are approximate, and may vary between individuals and monitors</td></tr>
	<tr class='colorblind'><td colspan='2'><mark class='footmark'>‡</mark>special thanks to: &nbsp;
		http://safecolours.rigdenage.com/colours2.html</td></tr>
</tfoot>
</table>


<table class='picker palette' id='Simple²'><caption><h6>Simple² Color Picker™</h6>click to choose</caption>
<tbody>
<tr>
<td colspan='3'><div class='indicator' id='Simple²saturation'>99.99%</div></td>
<td colspan='2'   style='border: 1px solid; border-bottom: none'
		>Chroma (Saturation)<br /><span class='lft'>0→</span>←‖1‖→<span class='rt'>←0</span></td>
<td colspan='2'><div class='indicator' id='Simple²hue'>359.999°</div></td>
</tr>
<tr>
<td   style='border-top: 1px solid; border-bottom: 1px solid;'
		><div><span class='lft'>0→</span>←←Saturation→→<span class='rt'>←1</span></div></td>
<td id="Simple²hSl"><canvas width='18' height='360'></canvas></td>
<td id="Simple²hSv" style='border-left: 1px solid;'
		><canvas width='18' height='360'></canvas></td>
<td id="Simple²wrapper" colspan='2'   style='border-left: 1px solid'
		><canvas width='360' height='360'></canvas></td>
<td   style='border: 1px solid; border-left: none'
		><div><span class='lft'>«0°→→</span>←←Hue→→<span class='rt'>←←360°»</span></div></td>
<td id="Simple²interface"><label id='Simple²_variety_transformer' data-fd-slider-rotate="90">variety<input type='range' name='Simple²_variety' value='12' min='12' max='360' step='2' data-fd-slider-transformer="Simple²_variety_transformer" /></label></td>
</tr>
<tr>
<td rowspan='5'  style='border-bottom: 1px solid' valign='bottom'
		><label for='Simple²_lock'>← lock ↑</label><input type='checkbox' name='Simple²_lock' value='locked' /></td>
<td   style='border-left: 1px solid'><div>HSL</div></td>
<td   style='border-left: 1px solid'><div>HSB</div></td>
<td    style='border: 1px solid; border-top: none'>Gray=0</td><td   style='border: 1px solid; border-top: none'>Gray=1</td>
<td id="Simple²swatch" colspan='2' rowspan='6' style='border: 1px solid white'></td>
</tr>
<tr>
<td   style='border-left: 1px solid'></td>
<td   style='border-left: 1px solid'></td>
<td id="Simple²hsV" colspan='2'><canvas width='360' height='18'></canvas></td>
</tr>
<tr>
<td   style='border-left: 1px solid'></td>
<td   style='border-left: 1px solid; border-bottom: 1px solid'></td>
<td colspan='2'   style='border-bottom: 1px solid'
		><span class='lft'>0→</span>←←Brightness / Value→→<span class='rt'>←1</span></td>
</tr>
<tr>
<td   style='border-left: 1px solid'></td>
<td></td>
<td id="Simple²hsL" colspan='2'><canvas width='360' height='18'></canvas></td>
</tr>
<tr>
<td   style='border-left: 1px solid; border-bottom: 1px solid'><div class='indicator' id='Simple²lvl'>99.99%</div></td>
<td   style='border-bottom: 1px solid'></td>
<td colspan='2'   style='border-bottom: 1px solid'
		><span class='lft'>0→</span>←←Lightness→→<span class='rt'>←1</span></td>
</tr>
<tr>
<td id="Simple²indicator" colspan='5'>&nbsp;</td>
</tr>
</tbody>
</table>


<table class='picker palette' id='YinYangNíHóng'><caption><h6>YinYang NíHóng<span>the Tao of Color Pickers™</span></h6>click to choose</caption>
<thead><tr>
<td><label><input type='radio' name='YinYang NíHóng' value='HSB' />HSB / HSV<dfn>Hue, Saturation, Brightness/Value</dfn></label></td>
<td><label><input type='radio' name='YinYang NíHóng' value='HSL' checked='checked' />HSL<dfn>Hue, Saturation, Lightness</dfn></label></td>
<td><label><input type='radio' name='YinYang NíHóng' value='HCG' />HCG<dfn>Hue, Chroma, Gray</dfn></label></td>
</tr></thead>
<tbody>
<tr><td colspan='3' id='YinYangNíHóng_swatch'><canvas width='421' height='421'></canvas></td></tr>
<tr><td colspan='3' id='YinYangNíHóng_indicator'>&nbsp;</td></tr>
</tbody>
<tfoot>
<tr><td colspan='3'><dfn>YinYang:</dfn> balance of interplay between opposites (here: light &amp; dark, color &amp; gray).</td></tr>
<tr><td><dfn>NíHóng:</dfn> Neon.</td><td><dfn>Ní:</dfn> Rainbow; You.</td><td><dfn>Hóng:</dfn> Rainbow; Great.</td></tr>
<tr><td colspan='3'><dfn>Tao:</dfn> all-encompassing unity with balance of the most simple way.</td></tr>
<tr><td colspan='3'>All 16,777,216 different colors the modern computer can show within 2 clicks.</td></tr>
</tfoot>
</table>

</section><!-- close MasterColorPicker_mainPanel -->


<div id='paletteLoadingAlert'>
 <h3>Loading Palettes:</h3>
 <div>Please Wait
<!--[if lt IE 10]>
	<br />Microsoft’s Internet Exploder takes quite a bit longer… … …
	<span>(and please be patient when changing color-picker settings)</span>
	<span>(or just use a <strong>real</strong> modern browser: Opera, Chrome, Safari)</span>
<![endif]-->
 </div>
<pre></pre></div><!--  do not separate or modify this line  -->


<script type="text/javascript" src="color-pickers/SoftMoon-WebWare/MasterColorPicker.js"></script>
<script type="text/javascript" src="color-pickers/SoftMoon-WebWare/color-space_autoReformatter.js"></script>
<script type="text/javascript">
with (SoftMoon.WebWare)  {  //UniDOM may be global or a property of SoftMoon.WebWare
UniDOM.addEventHandler(window, 'onload', function()  {
	initPaletteTables();
	activateColorSpaceFormatConverters(function() {return MasterColorPicker.registeredTargets});  } );  }
</script>
