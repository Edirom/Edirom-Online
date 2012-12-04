
/* getWidth() and getHeight() for different options of the CSS2 box-model
 *		possible values for 'outmostBorder' are: 'content'/'inner', 'padding', 'border'/'native' and 'margin'/'outer'
 *	 NOTICE: this functions require that all relevant dimension data has been assigned in pixels ('px')
 */
function getBoxModelWidth(element, outmostBorder)
{
	// get 'content + padding + border'
	var width = element.getWidth();
	
	if (outmostBorder == "padding" || outmostBorder == "content" || outmostBorder == "inner")
	{
		// reduce to 'content + padding'
		width -= getCssIntAttr(element,"border-left-width") + getCssIntAttr(element,"border-right-width");
		
		if (outmostBorder == "content" || outmostBorder == "inner")
		{
			// reduce to 'content'
			width -= getCssIntAttr(element,"padding-left") + getCssIntAttr(element,"padding-right");
		}
	}
	else if (outmostBorder == "margin" || outmostBorder == "outer")
	{
		// extend to 'content + padding + border + margin'
		width += getCssIntAttr(element,"margin-left") + getCssIntAttr(element,"margin-right");
	}
	return width;
}

function getBoxModelHeight(element, outmostBorder)
{
	// get 'content + padding + border'
	var height = element.getHeight();
	
	if (outmostBorder == "padding" || outmostBorder == "content" || outmostBorder == "inner")
	{
		// reduce to 'content + padding'
		height -= getCssIntAttr(element,"border-top-width") + getCssIntAttr(element,"border-bottom-width");
		
		if (outmostBorder == "content" || outmostBorder == "inner")
		{
			// reduce to 'content'
			height -= getCssIntAttr(element,"padding-top") + getCssIntAttr(element,"padding-bottom");
		}
	}
	else if (outmostBorder == "margin" || outmostBorder == "outer")
	{
		// extend to 'content + padding + border + margin'
		height += getCssIntAttr(element,"margin-top") + getCssIntAttr(element,"margin-bottom");
	}
	return height;
}

function getCssIntAttr(element, attrName)
{
	if (isNaN(parseInt(element.getStyle(attrName))))
		return 0;
	else
		return parseInt(element.getStyle(attrName));
}


// returns the first element hit by cssSelector that takes its space on the display (if visible or not)
function firstDisplayed(parentElem, cssSelector)
{
    var hitElems = parentElem.select(cssSelector);
    for (var i = 0; i < hitElems.length; i++) {
        if (hitElems[i].getStyle("display") != "none")
            return hitElems[i];
    }
    return null;
}

// uses the function firstDisplayed() to return a boolean if min. 1 element has been found
function displayedExists(parentElem, cssSelector)
{
    if(firstDisplayed(parentElem, cssSelector) != null)
        return true;
    else
        return false;
}



function validateXQueryDate(inputString) {
    // the XQuery dateTime format is YYYY-MM-DD
    
    arr = inputString.split("-");
    
    if (arr.length != 3 || arr[0].length > 4 || arr[1].length > 2 || arr[2].length > 2)
        return false;
    
    if (parseInt(arr[0]) == NaN || parseInt(arr[1]) == NaN || parseInt(arr[2]) == NaN)
        return false;
    
    monthMaxDays = new Array(31, 30, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    
    if (arr[0] < 1 || arr[1] < 1 || arr[1] > 12 || arr[2] < 1 || arr[2] > monthMaxDays[parseInt(arr[1]) - 1])
        return false
    
    return formatNumberString("0000-11-22", arr);
}

// builds a new string from signature, where the numbers in the signature are replaced by the corresponding array content (right-aligned)
// example: when signature is "00-11-2222" and inputArray is ["12", "3456", "78"] then the output string will be "12-56-0078"
function formatNumberString(signature, inputArray)
{
    var outputString = signature;
    
    var c;
    var content;
    var x;
    var newChar;
    
    // for every element in inputArray
    for (var i = 0; i <= 9; i++) {
        content = '';  // let content be a string
        if (i < inputArray.length)
            content += inputArray[i];
        
        x = content.length - 1;
        // for every digit in signature
        for (var j = signature.length - 1; j >= 0; j--) {
            c = signature.charAt(j);
            if (parseInt(c) == i) {
                // replace the character
                if (x >= 0) {
                    // replace with array content
                    newChar = content.charAt(x);
                    x --;
                } else {
                    // replace with '0'
                    newChar = '0';
                }
                outputString = replaceCharInString(outputString, j, newChar);
            }
        }
    }
    
    return outputString;
}

function replaceCharInString(str, index, newChar) {
    var out = '';
    
    if (index > 0)
        out += str.substring(0, index);
    
    out += newChar;
    
    if (index < str.length-1)
        out += str.substring(index+1, str.length);
    
    return out;
}



/*
 * Orginal: http://adomas.org/javascript-mouse-wheel/
 * prototype extension by "Frank Monnerjahn" themonnie @gmail.com
 */
Object.extend(Event, {
        wheel:function (event){
                var delta = 0;
                if (!event) event = window.event;
                if (event.wheelDelta) {
                        delta = event.wheelDelta/120;
                        if (window.opera) delta = -delta;
                } else if (event.detail) { delta = -event.detail/3;     }
                return delta;
        }
});