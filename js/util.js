/* From https://github.com/moll/js-element-from-point/blob/master/index.js */
var relativeToViewport;
function isRelativeToViewport() {
  if (relativeToViewport != null) return relativeToViewport;

  var x = window.pageXOffset ? window.pageXOffset + window.innerWidth - 1 : 0;
  var y = window.pageYOffset ? window.pageYOffset + window.innerHeight - 1 : 0;
  if (x === 0 && y === 0) return true;
  return relativeToViewport = !document.elementFromPoint(x, y)
}

function elementFromPoint(x, y) {
    if (!isRelativeToViewport()){
        x += window.pageXOffset;
        y += window.pageYOffset;
    }
    return document.elementFromPoint(x, y);
}

/* From https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string */
function extractHostname(url) {
	let hostname = url.indexOf("://") > -1 ?
		url.split('/')[2] :
		url.split('/')[0];
    hostname = hostname.split(':')[0];  /* Remove ports */
    hostname = hostname.split('?')[0];  /* Remove ? */
    return hostname;
}
function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split("."),
        arrLen = splitArr.length;
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2)
            domain = splitArr[arrLen - 3] + '.' + domain;
    }
    return domain;
}

/* Given an HTMl element and a function that returns
 * a boolean value, traverse up the parent nodes
 * until you reach an element where boolean_func
 * returns false */
function traverseUpwards(element, boolean_func){
    while(element.parentNode){
        if(!boolean_func(element.parentNode))
            return element;
        element = element.parentNode;
    }
    return element ? element : null;
}

/* Returns the zIndex of an element, or 0 if it's
 * not a number */
function getZindex(element){
    let z_index = window.getComputedStyle(element).zIndex;
    return z_index.match(/^[0-9]+$/) ? +z_index : 0;
}

/* Counts how many child elements are in an element,
 * including children of subelements */
function getElementChildCount(element){
    return element.getElementsByTagName("*").length;
}

/* Is an element visible? */
function isVisible(element){
    return element.offsetWidth > 0 && element.offsetHeight > 0;
}

/* Returns the CSS style of <element>. <style> is the property
 * you would access with element.style.<property> */
function getStyle(element, style){
    return window.getComputedStyle(element).getPropertyValue(style);
}

/* Tries to force an element to be scrollable and not blurred,
 * as some websites do this to remove usability */
function forceUseableInlineStyle(element){
    /* Re-enable scrollbars for the element */
    if(getStyle(element, "overflow") == "hidden")
        element.style.setProperty("overflow", "scroll", "important");
    if(getStyle(element, "overflowY") == "hidden")
        element.style.setProperty("overflowY", "scroll", "important");

    /* Disable any blurring that occurs */
    for(let prop of FILTER_PROPERTIES){
        if(getStyle(element, prop) && getStyle(element, prop).includes("blur"))
            element.style.setProperty(prop, "none", "important");
    }
}
