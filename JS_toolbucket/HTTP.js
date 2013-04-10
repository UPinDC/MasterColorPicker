/*  Aloha! and Mahalo for reading these comments.
  This code is based on code presented in the book:
		“JavaScript: The Definitive Guide” by David Flanagan; © 2006 O’Reily Media, Inc.; 978-0-596-10199-2
	and is overhauled by Joe Golembieski, SoftMoon WebWare.



	To Use:

	connector = new HTTP(…)   ← ← see this file’s end for comments on arguments passed in

	myconnection = HTTP.newConnection('http://mywebsite.net/mypage.htm', no_HTTP_Possible_Error)   ←  no_HTTP_Possible_Error may be a handler-function or a string Error message for a thrown error
	==or use==
	myconnection = HTTP.Connection('http://mywebsite.net/mypage.htm')   ←  AFTER you have called HTTP.newConnect at least ONCE; it has been established that HTTP is possible on this machine using this browser, and the proper init object has been found for this particular browser.

	myconnection.onFileLoad = function(userArgs… … …)  {……your code is passed userArgs from myconnection.getFile()……}
	myconnection.loadError = function(userArgs… … …)  {……optional handler for file load errors……}   ←  myconnect.errorMessage holds the error
	myConnection.tryAgain = function(userArgs… … …)  {……optional handler replaces the standard method to handle:
			 connection timeouts,  url-redirects,  and unknown server response codes……}
	myconnection.onMultiple = HTTP.handleMultiple    ← ↓ you may optionally use this inhouse function or create your own or use nothing and the loadError handler will handle it
	myconnection.onMultiple = function(userArgs… … …)  {……optional handler when the server has multiple choises for the given url……}

	connector.getFile(myconnection [, userArgs,… … …])   ←  pass in any number of user arguments to be passed on to all your event handlers

	myconnection_2 = HTTP.Connect('http://some-other-website.net/anotherpage.htm')   ←  AFTER you have called HTTP.newConnect at least ONCE; it has been established that HTTP is possible on this machine using this browser, and the proper init object has been found for this particular browser.
	=== set the onFileLoad, loadError, etc… methods for myconnection_2 ===
	=== note you could use the same handlers for both connections, and pass them different arguments through connector.getFile ===

	connector.getFile(myconnection_2 [, userArgs,… … …])   ← you can use the same connector for multiple connections



	The HTTP object is created in the global namespace to be useful to other scripts (besides SoftMoon WebWare’s)
	If this cluttters or conflicts with your workspace, you may move this HTTP object
to the  SoftMoon.WebWare.HTTP  scope chain by:
 • directly modifying the code below, or
 • loading this file and then executing:
		SoftMoon.WebWare.HTTP=HTTP;  //you may then do what you like with the global HTTP variable.
All SoftMoon.WebWare functions that use this HTTP object are code blocks dereferenced using  with(SoftMoon.WebWare) {}
Therefore, they can find the HTTP object as a global object or a property of the  SoftMoon.WebWare  object.
 */

HTTP=function(maxAttempts, timeoutDelay, retryDelayIncrease, retryDelayBuffer, redirectMax)  {
// SoftMoon.WebWare.HTTP=function()  {
	this.maxAttempts= (typeof maxAttempts == 'number') ? maxAttempts : HTTP.maxAttempts;
	this.timeoutDelay= (typeof timeoutDelay == 'number') ? timeoutDelay : HTTP.timeoutDelay;
	this.retryDelayIncrease= (typeof retryDelayIncrease == 'number') ? retryDelayIncrease : HTTP.retryDelayIncrease;
	this.retryDelayBuffer= (typeof retryDelayBuffer == 'number') ? retryDelayBuffer : HTTP.retryDelayBuffer;
	this.redirectMax= (typeof redirectMax == 'number') ? redirectMax : HTTP.redirectMax;
	}

// with (SoftMoon.WebWare)  {
HTTP.factories=[
	function() { return new XMLHttpRequest(); },
	function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
	function() { return new ActiveXObject('Microsoft.XMLHTTP'); }  ];

HTTP.factory=null;
HTTP.Connection=function(url)  { var connection=HTTP.factory();
	connection.attempts=0;  connection.redirects=0;  connection.url=url;
	return connection;  }

HTTP.newConnection=function(url, err) { var connection
	if (HTTP.factory != null)  {return HTTP.Connection(url);}
	for (var i=0; i<HTTP.factories.length; i++) {
		try {
			var connection=HTTP.factories[i]();
			if (connection != null)  {
				HTTP.factory=HTTP.factories[i];
				connection.attempts=0;
				connection.redirects=0;
				connection.url=url;
				return connection;  }  }
		catch(e)  {continue;}  }
	HTTP.factory=function() {
		if (typeof err=='function')  err();
		else if (typeof err=='string'  &&  err!="")  throw new Error(err);  }
	HTTP.factory();  }


HTTP.prototype.getFile=function(connection)  {
	var userArgs=Array.prototype.slice.call(arguments, 1),
			thisConnector=this;
	if (typeof connection.tryAgain != 'function')  connection.tryAgain=function()  {    //try «attempts» times, then stop and wait until called upon again
		if (connection.attempts<thisConnector.maxAttempts)  setTimeout(
			function() {
				userArgs.unshift(connection);
				thisConnector.getFile.apply(thisConnector, userArgs);  },
			thisConnector.retryDelayBuffer );
		else  {connection.trying=false;  if (typeof connection.loadError == 'function')  connection.loadError(thisConnector);}  }
//alert(url+"\nconnection attempts:"+connection.attempts);
	connection.attempts++;
	connection.trying=true;
	var timer=setTimeout(
		function() {connection.abort();  connection.tryAgain.apply(connection, userArgs);},
		this.timeoutDelay+(connection.attempts-1)*this.retryDelayIncrease );

	connection.onreadystatechange=function()  {
		if (connection.readyState>=3  &&  timer)  clearTimeout(timer);
		if (connection.readyState!=4)  return;
		connection.trying=false;
		switch (connection.status)  {
			case 200: {connection.onFileLoad.apply(connection, userArgs);  break;}   //  alert('connection complete: '+connection.url);
			case 300: if (typeof connection.onMultiple == 'function')  {  //multiple choices offered by the server - user must choose one.  responseText should hold more info
									connection.onMultiple.apply(connection, userArgs.slice(0).unshift(thisConnector));  break;  }
								connection.errorNotice='Server requires choosing file from multiple choises; no “onMultiple” method supplied.'
			case 404:
			case 410: { if (typeof connection.loadError == 'function')
										connection.loadError.apply(connection, userArgs);        //  alert(connection.url+"\nfailed status:"+connection.status);
							 break;  }
			case 301: HTTP.setPermenantRedirect(connection);  //this is a permenant redirect; below are temporary or “other”
			case 302:
			case 303:
			case 305:
			case 307: if (thisConnector.redirect(connection, connection.getResponseHeader('location'), userArgs)===false)  break;
			default:  connection.trying=true;  connection.tryAgain.apply(connection, userArgs);  }  }  //  alert(connection.url+"\nfailed status:"+connection.status);

	if (HTTP.redirectFilter(connection))  {  // url is OK as given or was changed to a new redirected url
		connection.open("GET", connection.url);
		connection.send(null);  }
	else  {   //  Url was redirected circularly
		if (typeof connection.loadError == 'function')
			connection.loadError.apply(connection, userArgs);  }  }


//avoid calling this method yourself unless you fully understand what you are doing
HTTP.prototype.redirect=function(connection, url, userArgs)  {
	if (!(connection.triedURLs instanceof Array))  connection.triedURLs=new Array;
	connection.triedURLs.push(connection.url);
	connection.url=url;
	connection.attempts=0;
	if ( ++connection.redirects > this.redirectMax)  {
		connection.erronNotice='More url redirects than allowed for. (max='+this.redirectMax+')';
		if (typeof connection.loadError == 'function')
			connection.loadError.apply(connection, userArgs);
		return false;  }
	return true;  }


HTTP.redirectFilter=function(connection)  { url=connection.url, unredirected=true;
	while (unredirected)  {
		for (var i=0; i<HTTP.redirectList.length; i++)  {
			if (HTTP.redirectList[i].substring(0, url.length+1)===url+' ')  {
				url=HTTP.redirectList[i].substring(url.length+1);  break;  }  }
		unredirected=false;  }
	if (connection.triedURLs instanceof Array)
		for (i=0; i<connection.triedURLs.length; i++)  {
			if (url===connection.triedURLs[i])  {
				connection.erronNotice='Url was redirected circularly to a url that was already tried by this connection.';
				connection.url=null;
				return false;  }  }
	return connection.url=url;  }


HTTP.setPermenantRedirect=function(connection)  {  var i, rd, rdTo=connection.getResponseHeader('location');
	for (var i=0; i<HTTP.redirectList.length; i++)  {
		rd=HTTP.redirectList[i].split(' ');  //  ←  ← yields →  [0: redirectFrom, 1: redirectTo]
		if (connection.url===rd[0]  ||  rdTo===rd[0])  return;  }

	HTTP.redirectList.push(connection.url+' '+rdTo);
	document.cookie='HTTP_RedirectList='+encodeURIComponent(HTTP.redirectList.join(','))+'; maxAge=2764800';  //32 days
}


;(function()  {
HTTP.redirectList=new Array();
	var i, cookies=document.cookie;
	cookies=cookies.split(';');
	for (i=0; i<cookies.length; i++)  {
		if (cookies[i].substring(0, 16)==='HTTPRedirectList')  {
			HTTP.redirectList=decodeURIComponent(cookies[i].substring(16)).split(',');  break;  }  }
}());



//You may use this as a method for your connection Object, if you choose.
//You will need to style the added notice using CSS.
/* ***  suggested CSS  ***

div#HTTP_handleMultipleFileDownloadChoises {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	padding: 2.618em;
	color: white;
	background-color: black; }
div#HTTP_handleMultipleFileDownloadChoises h1 {
	font-size: 1.618em;
	color: red; }
div#HTTP_handleMultipleFileDownloadChoises h1
div#HTTP_handleMultipleFileDownloadChoises p {
	margin-bottom: 1em; }
div#HTTP_handleMultipleFileDownloadChoises span.url,
div#HTTP_handleMultipleFileDownloadChoises input {
	font-family: monospace;
	display: block;
	width: 85.4%;  }   ≈ Φ + (1-Φ)*Φ

	 ***  *************  ***/
HTTP.handleMultiple=function(connector)  {
	if (this === HTTP)  throw new Error('“HTTP.handleMulptile is meant to be a method of an HTTP connection object');
	var userArgs=Array.prototype.slice.call(arguments, 1),
			notice=document.createElement('div');
	notice.innerHTML='<h1>attention sentients</h1>\n'+
		'<p>The server has notified this automation that a requested file download has multiple choices available.&nbsp;\n'+
		(this.filename ? ('The file requested is '+this.filename+'.&nbsp;\n') : "")+
		(this.fileinfo ? this.fileinfo : "")+
		'The file <acronym>URL</acronym> requested is: '+    // <abbr> is for HTML5; <acronym> is for MSIE-6, and should never have been depreciated.  Consider text-to-speach for visual impaired.  They USUALLY want to hear “U-R-L”, not “uniform-resource-locator”;  so if you add a title to <abbr> then you must add a classname, and CSS to specify all this, etc… but then FORCE them into this scheme.  Whereas users can set their readers to simply ignore titles in all <acronyms> unless asked for IF THEY WANT TO.
		'<span class="url">'+this.url+'</span></p>\n'+       //  no title is supplied for URL acronyms here because if the user doesn't understand “U-R-L”,  “uniform-resource-locator” won't be any better!  So using <abbr> here actually won't cause this reader problem; but it will break MSIE6, whereas using <acronym> is just, ahem, "politically incorrect".
		'<p>More specific information from the server is given below.</p>\n'+
		'<label>Please enter the new <acronym>URL</acronym> of you choice: <input type="text" /></label>\n'+
		'<pre>'+this.responseText+'</pre>';
	notice.id=arguments.callee.HTML_Element_id;
	document.appendChild(notice);
	var inp=notice.getElementsByTagName('input')[0],
			connection=this;
	inp.onblur=function()  {
		if (this.value==""  &&  !confirm('Do you want to abort loading '+(connection.filename || 'this file')+'?'))
			{this.focus();  return;}
		document.removeChild(notice);
		if (this.value  &&  connector.redirect(connection, this.value, userArgs))  {
			connection.trying=true;
			connection.tryAgain.apply(connection, userArgs);  }  }
	inp.focus();  }

HTTP.handleMultiple.HTML_Element_id='HTTP_handleMultipleFileDownloadChoises';


HTTP.maxAttempts=3  // how many times we should try to connect when there is no response from the server, or we get an unrecognized response status code
HTTP.timeoutDelay=25000  //25 seconds  =  how long to wait for a response from the remote server before giving up and possibly trying again
HTTP.retryDelayIncrease=5000   // added to the timeoutDelay each time we make another attempt (may be positive or negative)    ← response is usually fast, so if we are waiting a while, there is probably an internet connection error or server error, fixed by simply trying again.  However, the server may just be overwhelmed and slow to respond, so waiting a little longer each time we try again may be prudent.
HTTP.retryDelayBuffer=2000  // how long to wait between each attempt to retry a connection
HTTP.redirectMax=7  // how many redirects allowed before a load error
