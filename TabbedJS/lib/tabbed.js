var Tabs	= Tabs || {};
Tabs.sets	= {};
 
 /**********************************************
 *	Cross-browser Event listener code taken from:
 *		developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 ***********************************************/
Tabs.hookEvent=null;
Tabs.unhookEvent=null;
var IE = /MSIE (\d+\.\d+);/.test(navigator.userAgent);
var num = 9;
if(IE)
	num = new Number(RegExp.$1);

if(num<=7  || Element==undefined || Element.prototype==undefined || Element.prototype.addEventListener==undefined)
{
	var eventListeners = [];
	Tabs.hookEvent=function(self,type,func,useCapture)					// DONT EXTEND DOM. Not standardized and not cross-browser. Plus poor coding style
	{
		var wrapper=function(e)
		{
			e.target=e.srcElement;
			e.currentTarget=self;
			if (func.handleEvent)
				func.handleEvent(e);
			else
				func.call(self,e);
		};
		if (type=="DOMContentLoaded")
		{
			var wrapper2=function(e)
			{
				if (document.readyState=="complete")
					wrapper(e);
			};
			document.attachEvent("onreadystatechange",wrapper2);
			eventListeners.push({object:self,type:type,func:func,wrapper:wrapper2});
        
			if (document.readyState=="complete")
			{
				var e=new Event();
				e.srcElement=window;
				wrapper2(e);
			}
		}
		else
		{
			self.attachEvent("on"+type,wrapper);
			eventListeners.push({object:self,type:type,func:func,wrapper:wrapper});
		}
	};
	Tabs.unhookEvent = function(self,type, func, useCapture)
	{
		for(var i=eventListeners.length-1;i>=0;--i)		// Didn't care for the while loop they were using
		{													// Removed it and added a for loop counting backwards, in case I decided to remove the break later
			var evtList=eventListeners[i];
			if (evtList.object==self && evtList.type==type && evtList.func==func)
			{
				if (type=="DOMContentLoaded")
					type="readystatechange";
				
				self.detachEvent("on"+type,evtList.wrapper);

				eventListeners.splice(i, 1);
				break;
			}
		}
	};
}
else
{
	Tabs.hookEvent=function(elm,type,func,cap){elm.addEventListener(type,func,cap);};
	Tabs.unhookEvent=function(elm,type,func,cap){elm.removeEventListener(type,func,cap);};
}
 
 
 
 // Cross-browser attribute grabber function
Tabs.getAttribute	= function(elm,attrib)
{
	return elm.dataset ? elm.dataset[attrib] : elm.getAttribute("data-"+attrib);	// If we have dataset, use that, otherwise revert to the old getAttribute
};
 
 
 /*************************************************
*	-==  TabContainer  ==-
*		Base class for any tab-related collections
*		Provides basic functionality for collection population
*		Also sets up basis for easy searching
***************************************************/
Tabs.TabContainer	= function(group)
{
	this.name		= group ? group : "";
	this.active		= null;
	this.collection	= {};
};
Tabs.TabContainer.prototype.setActive			= function(name)
{
	if(this.active!=null)
	{
		if(this.active.name == name) return true;
		else this.active.className = this.active.className.replace(" active","");
	}
	if(this.collection[name]!=undefined)
	{
		this.active = this.collection[name];
		this.active.className += " active";
		return true;
	}
	this.active = null;
	return false;
};
Tabs.TabContainer.prototype.getCollectionNames			= function()
{
	var names = [];
	for(var key in this.collection)
		if(this.collection.hasOwnProperty(key))
			names.push(key);
	return names;
};
 
Tabs.TabContainer.prototype.update	= function(className)
{
	if(!this.name || this.name=="")
		return false;
	
	// Make a list of keys that currently exist. We'll delete them from this list as they're rediscovered
	var	keys = this.getCollectionNames();
	var elms = Tabs.getElementsByClassName(className);
	var count = 0;
	for(var i=0;i<elms.length;++i)
	{
		var elm = elms[i];
		if(Tabs.getAttribute(elm,"tabgroup")==this.name)
		{
			var tabName = Tabs.getAttribute(elm,"tabname");
			if(tabName==undefined) continue;
			
			this.collection[tabName] = elm;
			// Remove this from the keys list if it's in there
			for(var j=0;j<keys.length;++j)
				if(keys[j]==tabName)
					delete keys[j];
			
			// Add the click event for the tab
			if(className=="tab")
			{
				Tabs.unhookEvent(elm,"click",Tabs.swapListener,true);
				Tabs.hookEvent(elm,"click",Tabs.swapListener,true);
			}
		
			count++;
			if(elm.className.indexOf(" active")>-1)
				this.active = elm;
		}
	}
	// Any remaining keys in the list no longer exist. Delete
	for(var i=0;i<keys.length;++i)
	{
		delete this.collection[keys[i]];
	}
	return count>0;
};



 /*************************************************
*	-==  TabSet  ==-
*		A grouping of a TabStrip and a TabContents objects
*		Used to keep named tab pieces together
*		Also adds convenience functions
***************************************************/
Tabs.TabSet		= function(group)
{
	this.name = group;
	this.strip = new Tabs.TabContainer(group);
	this.content = new Tabs.TabContainer(group);
};
Tabs.TabSet.prototype.isValid		= function()
{
	return !(this.strip==null || this.content==null);
};
Tabs.TabSet.prototype.update		= function()
{
	if(!this.isValid())
		return false;
	
	return this.strip.update("tab")	&&	this.content.update("tabContent");
};
Tabs.TabSet.prototype.setActiveTab	= function(name)
{
	if(!this.isValid())
		return false;
	return this.strip.setActive(name)	&&	this.content.setActive(name);
};



/*****************************************************
*	Begin Tabs convenience functions
******************************************************/

Tabs.swapTab	= function(group, name)
{
	if(Tabs.sets[group] != undefined)											// If this tab group is already registered, no need to search
		return Tabs.sets[group].setActiveTab(name);
	var obj = new Tabs.TabSet(group);
	
	if(!obj.update())											// Update the collections. Will return false if either is null
		return false;

	obj.setActiveTab(name);										// Set the active tab
	Tabs.sets[group] = obj;									// If everything is found, register the group for easy access later
	return true;													// AND return true
};
 
Tabs.swapListener	= function(e)
{
	Tabs.swapTab(Tabs.getAttribute(this,"tabgroup"),Tabs.getAttribute(this,"tabname"));
};

Tabs.getElementsByClassName = function(className)
{
	if(document.getElementsByClassName) return document.getElementsByClassName(className);
	var elms = document.getElementsByTagName("*");
	var reg = new RegExp("(?:^| )("  +  className  +  ")(?: |$)");			// (?:^| )(className)(?: |$) /		provided classname is preceded by either space or beginning of line, and succeeded by space or end of line
	var arr = [];
	for(var i=0;i<elms.length;++i)
	{
		if(reg.test(elms[i].className))
			arr.push(elms[i]);
	}
	return arr;
};
 
 
Tabs.updateAll	= function()
{
	for(var key in Tabs.sets)
	{
		if(Tabs.sets.hasOwnProperty(key))
			delete Tabs.sets[key];
	}
	 
	var tabs = Tabs.getElementsByClassName("tab");
	var ignore = {};
	 
	for(var i=0;i<tabs.length;++i)
	{
		var group = Tabs.getAttribute(tabs[i],"tabgroup");
		if(group==undefined || Tabs.sets[group]!=undefined || ignore[group]===true)		// Ignore any tabs that don't have a group or whose group already exists
			continue;
			
		var obj = new Tabs.TabSet(group);
		if(!obj.update())
		{
			ignore[group]=true;												// This group won't work, ignore future listings
			continue;
		}
		Tabs.sets[group] = obj;
	}
};

Tabs.styles = null;
Tabs.addCSSRule=function(rule)
{
	if(Tabs.styles==null)
	{
		Tabs.styles = document.createElement("style");			// For WebKit. It won't append blank styles
		if(!IE)Tabs.styles.appendChild(document.createTextNode("") )
		var head = document.getElementsByTagName("head")[0];
		if(head.hasChildNodes)
			head.insertBefore(Tabs.styles,head.childNodes[0] );
		else
			head.appendChild(Tabs.styles);
	}
	if( (!IE || num>=8) && CSSStyleSheet!=undefined && CSSStyleSheet.prototype.insertRule!=undefined)
		document.styleSheets[0].insertRule(rule,document.styleSheets[0].length);
	else if(num<8)
		Tabs.styles.styleSheet.cssText += rule;
	else
		Tabs.styles.appendChild(document.createTextNode(rule));
};
 
Tabs.init				= function()
{
	Tabs.addCSSRule(".tabContent{display:none;}");
	Tabs.addCSSRule(".tabContent.active{display:block;}");
	Tabs.updateAll();
};
Tabs.hookEvent(window,"load",Tabs.init,true);
 
