/**************************************
	Color Picker Utility
Created By:	Erekose Craft
Website:	airakose.com
This software is free for use and distribution as long as this statement remains unaltered within the source.
**************************************/
var Utility	= Utility || {};

Utility.stretchLinear	= function(arr,min,max)
{
	var biggest = arr[0],smallest=arr[0];
	for(var i=1;i<arr.length;++i)
	{
		if(arr[i]>biggest)
			biggest = arr[i];
		else if(arr[i]<smallest)
			smallest = arr[i];
	}
	var range = biggest-smallest;
	if(range==0)
	{
		for(var i=0;i<arr.length;++i)
			arr[i]=max;
		return arr;
	}
	for(var i=0;i<arr.length;++i)	// Linearly scale all of the values
		arr[i] = (arr[i]-smallest)/range*(max-min)+min;

	return arr;
}
Utility.clamp	= function(val,min,max)
{
	return Math.min(Math.max(val,min),max);
}

Utility.ColorHSV=function(h,s,v)
{
	this.h=h?h:0;
	this.s=s?s:0;
	this.v=v?v:0;
}
Utility.ColorHSV.prototype.getRGB	= function(hue,sat,value)
{
	var tr = Utility.clamp(Math.max(-Math.abs(1530*(hue-0)) , -Math.abs(1530*(hue-1)))+510,0,255);
		tr = (tr*sat+(1-sat)*255)*value;
	var tg = Utility.clamp(-Math.abs(1530*(hue-1/3))+510,0,255);
		tg = (tg*sat+(1-sat)*255)*value;
	var tb = Utility.clamp(-Math.abs(1530*(hue-2/3))+510,0,255);
		tb = (tb*sat+(1-sat)*255)*value;
	return new Utility.ColorRGB(Math.round(tr),Math.round(tg),Math.round(tb));
}
Utility.ColorHSV.prototype.toRGB	= function()
{
	return this.getRGB(this.h,this.s,this.v);
}
Utility.ColorHSV.prototype.toCleanRGB	= function()
{
	return this.getRGB(this.h,1,1);
}
Utility.ColorHSV.prototype.toString	= function()
{
	return "hsv("+this.h+","+this.s+","+this.v+")";
}


Utility.ColorRGB=function(r,g,b)
{
	this.r=r?r:0;
	this.g=g?g:0;
	this.b=b?b:0;
}
Utility.ColorRGB.prototype.toMaxSaturation	= function()
{
	var col = Utility.stretchLinear([this.r,this.g,this.b],0,255);
	return new Utility.ColorRGB(col[0],col[1],col[2]);
}
Utility.ColorRGB.prototype.getHSV	= function(r,g,b)
{
	var col = this.toMaxSaturation();
	var hue = 0;
	if(col.r!=0)
	{
		if(col.b>0)				// If blue is the other color on hue spectrum with red
			hue = ((col.r-col.b)/255)/6 + (5/6);
		else						// Otherwise assume green
			hue = ((col.g-col.r)/255)/6 + (1/6);
	}
	else					// If red is empty
		hue = ((col.b-col.g)/255)/6+0.5;	// We use the green and blue
	
	var bright = 0;
	if(col.r==255)
		bright = r/col.r;
	else if(col.g==255)
		bright = g/col.g;
	else
		bright = b/col.b || 0;
	
	var sat = 1;
	if(bright>0)
	{
		if(col.b==0)
			sat = b/bright;
		else if(col.g==0)
			sat = g/bright;
		else
			sat = r/bright;
	}
	return new Utility.ColorHSV(hue,(1-sat/255),bright);
}
Utility.ColorRGB.prototype.toHSV	= function()
{
	return this.getHSV(this.r,this.g,this.b);
}
Utility.ColorRGB.prototype.getHexString	= function(r,g,b)
{
	return (r*65536 + g*256 + b).toString(16);
}
Utility.ColorRGB.prototype.toHexString	= function()
{
	return this.getHexString(this.r,this.g,this.b);
}
Utility.ColorRGB.prototype.toString	= function()
{
	return "rgb("+this.r+","+this.g+","+this.b+")";
}
Utility.ColorRGB.prototype.invert		= function()
{
	return new Utility.ColorRGB(255-this.r,255-this.g,255-this.b);
}




Utility.ColorPicker=function(parent)
{
	this._hsv			= new Utility.ColorHSV(0,1,1);
	this._rgb			= this._hsv.toRGB();
	this._alpha			= 1;
	this._container		= null;
	this._hueSlider		= {canvas:null,ctx:null,prerender: null};
	this._aSlider		= {canvas:null,ctx:null,prerender: null};
	this._picker		= {canvas:null,ctx:null,prerender: null};

	if(parent)
		this.create(parent);
}

Utility.ColorPicker.prototype.getHSV	= function()
{
	return this._hsv;
}
Utility.ColorPicker.prototype.getRGB	= function()
{
	return this._rgb;
}
Utility.ColorPicker.prototype.getAlpha	= function()
{
	return this._alpha;
}
Utility.ColorPicker.prototype.toHexString = function()
{
	return this._rgb.toHexString();
}
Utility.ColorPicker.prototype.toString = function()
{
	if(_alpha==1)
		return "rgb("+_rgb.r+","+_rgb.g+","+_rgb.b+")";
	return "rgba("+_rgb.r+","+_rgb.g+","+_rgb.b+","+_alpha+")";
}

Utility.ColorPicker.prototype.create	= function(parent)
{
	var owner = this;
	this.destroy();
	this._container 				= document.createElement("div");
	this._container.className		= "colorPicker";
	
	this._picker.canvas				= document.createElement("canvas");
	this._picker.canvas.width		= 256;
	this._picker.canvas.height		= 256;
	this._picker.canvas.className	= "picker";
	this._picker.canvas.onmousedown = function(evt){
		Utility._activePicker.obj=owner;Utility._activePicker.type="picker";
		Utility._handleMouseMove(evt);
	};
	this._picker.ctx				= this._picker.canvas.getContext('2d');
	this._picker.prerender			= document.createElement("canvas");
	this._picker.prerender.width	= 256;
	this._picker.prerender.height	= 256;
	this._container.appendChild(this._picker.canvas);
	
	this._hueSlider.canvas			= document.createElement("canvas");
	this._hueSlider.canvas.width	= 16;
	this._hueSlider.canvas.height	= 256;
	this._hueSlider.canvas.className= "hueSlider";
	this._hueSlider.canvas.onmousedown=function(evt){
		Utility._activePicker.obj=owner;Utility._activePicker.type="hueSlider";
		Utility._handleMouseMove(evt);
	};
	this._hueSlider.ctx				= this._hueSlider.canvas.getContext('2d');
	this._hueSlider.prerender		= document.createElement("canvas");
	this._hueSlider.prerender.width	= 16;
	this._hueSlider.prerender.height= 256;
	this._container.appendChild(this._hueSlider.canvas);
	
	this._container.appendChild(document.createElement("br"));
	
	this._aSlider.canvas			= document.createElement("canvas");
	this._aSlider.canvas.width		= 256;
	this._aSlider.canvas.height		= 16;
	this._aSlider.canvas.className	= "alphaSlider";
	this._aSlider.canvas.onmousedown= function(evt){
		Utility._activePicker.obj=owner;Utility._activePicker.type="alphaSlider";
		Utility._handleMouseMove(evt);
	};
	this._aSlider.ctx				= this._aSlider.canvas.getContext('2d');
	this._aSlider.prerender			= document.createElement("canvas");
	this._aSlider.prerender.width	= 256;
	this._aSlider.prerender.height	= 16;
	this._container.appendChild(this._aSlider.canvas);
	
	parent.appendChild(this._container);
	
	this.prerenderPicker();
	this.renderPicker();
	this.prerenderHueSlider();
	this.renderHueSlider();
	this.prerenderAlphaSlider();
	this.renderAlphaSlider();
}

Utility.ColorPicker.prototype.destroy	= function()
{
	if(!this._container) return;
	while(this._container.hasChildNodes())
		this._container.removeChild(this._container.childNodes[0]);
	
	this._container.parentNode.removeChild(this._container);
	
	this._container			= null;
	
	this._picker.canvas		= null;
	this._picker.ctx		= null;
	this._picker.prerender	= null;		
	
	this._hueSlider.canvas	= null;
	this._hueSlider.ctx		= null;
	this._hueSlider.prerender=null;
	
	this._aSlider.canvas	= null;
	this._aSlider.ctx		= null;
	this._aSlider.prerender	=null;
}


Utility.ColorPicker.prototype.prerenderPicker	= function()
{
	var ctx = this._picker.prerender.getContext('2d');
	var r,g,b;
	var cols = this._hsv.toCleanRGB();
	r=cols.r;g=cols.g;b=cols.b;
	if(r==g && r==b)
	{
		r=255; g=0; b=0;
	}
	
	var d = ctx.getImageData(0,0,256,256);
	for(var y=0;y<256;++y)
	{
		var bright = 1-(y/255);
		for(var x=0;x<256;++x)
		{
			var sat = (x/255);
			
			var i = (y*256+x)*4;
			
			
			d.data[i+0] = (r*sat+255*(1-sat))*bright;
			d.data[i+1] = (g*sat+255*(1-sat))*bright;
			d.data[i+2] = (b*sat+255*(1-sat))*bright;
			d.data[i+3] = 255;
		}
	}
	ctx.putImageData(d,0,0);
}

Utility.ColorPicker.prototype.prerenderHueSlider	= function()
{
	var ctx = this._hueSlider.prerender.getContext("2d");
	var grad = ctx.createLinearGradient(0,0, 0,256);
	grad.addColorStop(0/6, "RGB(255,0,0)");
	grad.addColorStop(1/6, "RGB(255,255,0)");
	grad.addColorStop(2/6, "RGB(0,255,0)");
	grad.addColorStop(3/6, "RGB(0,255,255)");
	grad.addColorStop(4/6, "RGB(0,0,255)");
	grad.addColorStop(5/6, "RGB(255,0,255)");
	grad.addColorStop(6/6, "RGB(255,0,0)");
	
	ctx.fillStyle=grad;
	ctx.fillRect(0,0,16,256);
}

Utility.ColorPicker.prototype.prerenderAlphaSlider	= function()
{
	var ctx = this._aSlider.prerender.getContext("2d");
	ctx.fillStyle="RGB(250,250,250)";
	ctx.fillRect(0,0,256,16);
	ctx.fillStyle="RGB(220,220,220)";
	for(var y=0;y<16;y+=8)
	{
		for(var x=y;x<256;x+=16)
		{
			ctx.fillRect(x,y,8,8);
		}
	}
	
	var grad = ctx.createLinearGradient(0,0,256,0);
	grad.addColorStop(1,"rgba(255,255,255,1)");
	grad.addColorStop(0,"rgba(255,255,255,0)");
	
	ctx.fillStyle=grad;
	ctx.fillRect(0,0,256,16);
	
	
	grad = ctx.createLinearGradient(0,0,256,0);
	grad.addColorStop(1,"rgba(255,255,255,1)");
	grad.addColorStop(0,"rgba(0,0,0,1)");
	
	ctx.fillStyle=grad;
	ctx.fillRect(0,12,256,4);
}


Utility.ColorPicker.prototype.renderPicker			= function()
{
	var ctx = this._picker.ctx;
	ctx.drawImage(this._picker.prerender,0,0);
	
	
	var x = this._hsv.s*256,
		y = (1-this._hsv.v)*256;	
	ctx.beginPath();
		ctx.moveTo(x+5.5,y);
		ctx.arc(x,y,5.5,  0,Math.PI*2,  true);
	ctx.closePath();
	ctx.strokeStyle="rgb(0,0,0)";
	ctx.stroke();
	
	
	ctx.beginPath();
		ctx.moveTo(x+4.5,y);
		ctx.arc(x,y,4.5,  0,Math.PI*2,  true);
	ctx.closePath();
	ctx.strokeStyle="rgb(255,255,255)";
	ctx.stroke();
}

Utility.ColorPicker.prototype.renderHueSlider		= function()
{
	var ctx = this._hueSlider.ctx;
	
	ctx.drawImage(this._hueSlider.prerender,0,0);
	
	var y = this._hsv.h*256;
	ctx.lineWidth = 1;
	ctx.strokeStyle="rgb(0,0,0)";
	ctx.beginPath();
		ctx.moveTo(0,y-1.5);
		ctx.lineTo(16,y-1.5);
		ctx.moveTo(0,y+1.5);
		ctx.lineTo(16,y+1.5);
	ctx.stroke();
	ctx.closePath();
}

Utility.ColorPicker.prototype.renderAlphaSlider		= function()
{
	var ctx = this._aSlider.ctx;
	ctx.drawImage(this._aSlider.prerender,0,0);
	
	var x = this._alpha*256;
	ctx.lineWidth	= 2;
	ctx.strokeStyle	= "rgb(0,0,0)";
	ctx.beginPath();
		ctx.moveTo(x,0);
		ctx.lineTo(x,16);
		ctx.stroke();
	ctx.closePath();
};

Utility.ColorPicker.prototype.selectOnPicker	= function(x,y)
{
	x=x/256;
	y=y/256;
	this.setHSV(this._hsv.h,x,1-y);
	this.onChange();
	this.renderPicker();
};

Utility.ColorPicker.prototype.selectOnHueSlider	= function(y)
{
	y=y/256;
	this.setHSV(y,this._hsv.s,this._hsv.v);
	this.onChange();
	this.renderHueSlider();
	this.prerenderPicker();
	this.renderPicker();
};

Utility.ColorPicker.prototype.selectOnAlphaSlider= function(x)
{
	x=x/256;
	this._alpha = x;
	this.onChange();
	this.renderAlphaSlider();
};

Utility.ColorPicker.prototype.setRGB		= function(r,g,b,t)
{
	this._rgb.r	= r?r:0;
	this._rgb.g	= g?g:0;
	this._rgb.b	= b?b:0;
	this._hsv 	= this._rgb.toHSV();
	
	if(t)
		this.onChange();
	this.prerenderPicker();
	this.renderPicker();
	this.renderHueSlider();

	return this._rgb;
}
Utility.ColorPicker.prototype.setRGBA		= function(r,g,b,a,t)
{
	this._rgb.r	= r?r:0;
	this._rgb.g	= g?g:0;
	this._rgb.b	= b?b:0;
	this._hsv 	= this._rgb.toHSV();
	this._alpha	= a;
	
	if(t)
		this.onChange();
	this.prerenderPicker();
	this.renderPicker();
	this.renderHueSlider();
	this.renderAlphaSlider();

	return this._rgb;
}

Utility.ColorPicker.prototype.setHSV		= function(h,s,v,t)
{
	this._hsv.h = h?h:0;
	this._hsv.s = s?s:0;
	this._hsv.v	= v?v:0;
	this._rgb	= this._hsv.toRGB();
	
	if(t)
		this.onChange();
	this.prerenderPicker();
	this.renderPicker();
	this.renderHueSlider();

	return this._hsv;
}
Utility.ColorPicker.prototype.setHSVA		= function(h,s,v,a,t)
{
	this._hsv.h = h?h:0;
	this._hsv.s = s?s:0;
	this._hsv.v	= v?v:0;
	this._rgb	= this._hsv.toRGB();
	this._alpha	= a;
	
	if(t)
		this.onChange();
	this.prerenderPicker();
	this.renderPicker();
	this.renderHueSlider();
	this.renderAlphaSlider();

	return this._hsv;
}
Utility.ColorPicker.prototype.setAlpha		= function(a)
{
	this._alpha = a;
	
	this.onChange();
	this.renderAlphaSlider();

	return this._alpha;
}

Utility.ColorPicker.prototype.onAfterChange	= function(){};

Utility.ColorPicker.prototype.onChange		= function(){};


Utility._activePicker						= {obj:null,type:""};
Utility._handleMouseMove					= function(evt)
{
	if(Utility._activePicker.obj != null)
	{
		var type = Utility._activePicker.type;
		var obj = Utility._activePicker.obj;
		var elm = obj._picker.canvas;
		if(type=="hueSlider")
			elm		= obj._hueSlider.canvas;
		else if(type=="alphaSlider")
			elm		= obj._aSlider.canvas;
		
		var bounds	= elm.getBoundingClientRect();
		var x = evt.pageX-bounds.left; var y = evt.pageY-bounds.top;
		
		if(type=="picker")
		{
			x=Math.min(Math.max(0,x),256);
			y=Math.min(Math.max(0,y),256);
			obj.selectOnPicker(x,y);
		}
		else if(type=="hueSlider")
		{
			y=Math.min(Math.max(0,y),256);
			obj.selectOnHueSlider(y);
		}
		else
		{
			x=Math.min(Math.max(0,x),256);
			obj.selectOnAlphaSlider(x);
		}
	}
}
Utility._handleMouseUp						= function()
{
	if(Utility._activePicker.obj != null)
	{
		Utility._activePicker.obj.onAfterChange();
		Utility._activePicker.obj	= null;
	}
}
window.addEventListener("mousemove",Utility._handleMouseMove);
window.addEventListener("mouseup",	Utility._handleMouseUp);
