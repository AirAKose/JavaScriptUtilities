======================================================================
		JavaScript Color Picker Utility
    --------------------------------------------------------------
======================================================================

	Description:

This utility adds a functioning square color picker to the page with a saturation+brightness box, a hue slider, and an alpha slider.

______________________________________________________________________

	Use:

In JavaScript, create a color picker with "new Utility.ColorPicker([parent])" where the optional [parent] is a javascript reference to the element on the page where you want to add the color picker.

Set the ColorPicker's onChange event to catch when the color is changed.

-	-	-	-	-	-	-	-	-	-
**In the below examples, ColorPickerRef is a variable that holds an already-made ColorPicker object.
**	ColorRGB is an RGB color variable with the members r, g, b
**	ColorHSV is an HSV color variable with the members h, s, v

--------------
ColorPickerRef.create(parent)
	Create or recreate the color picker as a child of parent.
	Will delete the old one if it already exists.

ColorPickerRef.delete()
	Removes the currently existing color picker from the page.

ColorPickerRef.getRGB()
	Returns an object with the Red, Green, and Blue values selected on the color picker.
	Accessed via color.r, color.g, and color.b [0-255]

ColorPickerRef.getHSV()
	Returns an object with the Hue, Saturation, and Value values selected on the color picker.
	Accessed via color.h, color.s, and color.v [0.0-1.0]

ColorPickerRef.getAlpha()
	Returns a number representing the selected alpha value. [0.0-1.0]

ColorPickerRef.toHexString()
	Returns a string representing the RGB values selected on the color picker in hexadecimal.
		ex: "0f0f0f"

ColorPickerRef.toString()
	Returns a string representing the RGB or RGBA values selected on the color picker.
		ex: "rgb(255,255,255)" or "rgba(255,255,255,0.5)" if the alpha value isn't 1.

ColorPickerRef.setRGB(r,g,b,[trigger])
	Sets the Red, Green, and Blue values on the color picker. [0-255]
	Returns an object with the Red, Green, and Blue values as r,g,b. [0-255]
	[trigger] is an optional parameter that if set to true will trigger onChange

ColorPickerRef.setRGBA(r,g,b,a,[trigger])
	Sets the Red, Green, Blue [0-255], and alpha [0.0-1.0] values on the color picker 
	Returns an object with the Red, Green, and Blue values as r,g,b. [0-255]
	[trigger] is an optional parameter that if set to true will trigger onChange

ColorPickerRef.setHSV(h,s,v,[trigger])
	Sets the Hue, Saturation, and Value values on the color picker. [0.0-1.0]
	Returns an object with the Hue, Saturation, and Value values as h,s,v. [0.0-1.0]
	[trigger] is an optional parameter that if set to true will trigger onChange

ColorPickerRef.setHSVA(h,s,v,a,[trigger])
	Sets the Hue, Saturation, Value, and alpha values on the color picker. [0.0-1.0]
	Returns an object with the Hue, Saturation, and Value values as h,s,v. [0.0-1.0]
	[trigger] is an optional parameter that if set to true will trigger onChange

ColorPickerRef.setAlpha(a,[trigger])
	Sets the alpha value on the color picker. [0.0-1.0]
	Returns a number that is the set alpha. [0.0-1.0]
	[trigger] is an optional parameter that if set to true will trigger onChange

----------------
ColorHSV.toRGB()
	Returns an RGB color that represents the HSV color.

ColorHSV.toCleanRGB()
	Returns an RGB color that represents the current Hue with max Saturation and Value.

ColorHSV.toString()
	Returns a string that represents the HSV values.
		ex: "hsv(1,1,1)"

----------------
ColorRGB.toHSV()
	Returns an HSV color that represents the RGB color.

ColorRGB.toMaxSaturation()
	Returns an RGB color that represents a fully saturated version of the current color.

ColorRGB.invert()
	Returns an RGB color that is inverted from the current RGB values.

ColorRGB.toHexString()
	Returns a string that represents the RGB values in hexadecimal.
		ex: "0f0f0f"

ColorRGB.toString()
	Returns a string that represents the RGB values.
		ex: "rgb(255,255,255)"

______________________________________________________________________

	Requirements:

Other libraries:	NONE
Browser:		Any browser that supports HTML5 and the Canvas element.
			IE9+,FF 3.6+,Chrome 4+,Safari 4+, Opera 9+


______________________________________________________________________

	License:

This software is provided as-is without warranty. It is free for use and distribution so long as the ownership statement within the source remains attached and unaltered from the below text:


/**************************************
	Color Picker Utility
Created By:	Erekose Craft
Website:	airakose.com
This software is free for use and distribution as long as this statement remains unaltered within the source.
**************************************/
______________________________________________________________________
