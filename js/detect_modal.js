/* Detects modals and returns the html
 * object associated with it */


/**
 * getModalProb - Returns how likely an HTML
 * element is a modal, as a float starting from 0
 *
 * @param  {Object} html_element The HTML element to analyze
 * @return {Number}              Float, 0 = no chance, higher = more chance
 */
function getModalProb(html_element){
    var prob = 0.0;

    /* <header> and <script>, etc... are not likely to be modals */
    if(ALLOWED_MODAL_TAGS.includes(html_element.tagName.toLowerCase()))
        return 0.0;
    /* Modals usually contain text (Ignoring image only modals, I mean your
     * website can't be that bad right?) */
    let lower_inner_text = html_element.innerText ? html_element.innerText.toLowerCase() : "";
    let inner_html = html_element.innerHTML.toLowerCase();
    if(lower_inner_text.length < 4)
        return 0.0;

    /* Modal keywords are present either in url or innerText */

    lower_inner_text += Array.from(html_element.getElementsByTagName("a")).map(x => x.href.split("://")[1]).join("");

    for(let keyword of BAD_MODAL_WORDS){
        if(lower_inner_text.includes(keyword))
            prob += BAD_WORD_PROB;
    }

    /* Modal contains good keywords that signify that it's
     * not a modal */
    for(let keyword of GOOD_MODAL_KEYWORDS){
        if(lower_inner_text.includes(keyword))
            prob += GOOD_MODAL_WORD_PROB;
    }

    for(let keyword of BAD_MODAL_HTML_KEYWORDS){
        if(inner_html.includes(keyword))
            prob += BAD_HTML_PROB;
    }

    /* Modal is fixed position, (or relative/absolute) */
    if(MODAL_POSITIONS.likely.includes(html_element.style.position))
        prob += MODAL_POSITION_LIKELY_PROB;
    if(MODAL_POSITIONS.maybe.includes(html_element.style.position))
        prob += MODAL_POSITION_MAYBE_PROB;

    /* Modal contains an input action such as "sign up",
     * "email" or "close", etc... */
    if(inner_html.toLowerCase().includes("<input") || inner_html.includes("<button"))
        prob += MODAL_ACTION_PROB;

    /* Modal has high z-index */
    if(getZindex(html_element) >= MODAL_MIN_Z_INDEX)
        prob += MODAL_Z_INDEX_PROB;

    /* Element contains classnames such as "popup", "modal",
     * "lightbox", etc... */
    let lower_class_name = typeof html_element.className == "string" ? html_element.className.toLowerCase() : "";
    for(let bad_word of BAD_MODAL_CLASS_NAMES)
        if(lower_class_name.includes(bad_word)) prob += MODAL_BAD_CLASS_NAME_PROB;

    /* Element has too much text */
    if(html_element.innerText && html_element.innerText.length > MAX_TEXT_LIMIT)
        prob -= LOTS_OF_TEXT_DAMAGE;

    return prob;
}

/**
 * getCoverProb - Returns how likely an HTML
 * element is a cover, as a float starting from 0.0
 *
 * @param  {Object} html_element The HTML element to analyze
 * @return {Number}              Float , 0 = no chance, higher = more chance
 */
function getCoverProb(html_element){
    /* z-index of 0 or less is VERY unlikely */
    if(getZindex(html_element) <= 0)
        return 0.0;
    /* <header> and <script>, etc... are not likely to be modals */
    if(ALLOWED_MODAL_TAGS.includes(html_element.tagName.toLowerCase()))
        return 0.0;

    let prob = 0.0;

    /* Element is blurred */
    for(let prop of FILTER_PROPERTIES){
        if(getStyle(html_element, prop) && getStyle(html_element, prop).includes("blur")){
            prop += COVER_BLUR_PROB;
            break;
        }
    }

    /* Element is black */
    if(["#000", "#000000", "black", "rgb(0", "rgba(0"].includes(getStyle(html_element, "backgroundColor")))
        prop += COVER_BLUR_PROB;

    /* Element is not scrollable */
    if(getStyle(html_element, "overflowY") == "hidden" || getStyle(html_element, "overflow") == "hidden")
        prob += COVER_NOT_SCROLLABLE_PROB;

    /* Element has high z-index */
    if(getZindex(html_element) >= MODAL_MIN_Z_INDEX)
        prob += COVER_Z_INDEX_PROB;

    /* Element covers entire screen */
    if(html_element.offsetWidth >= window.innerWidth * HW_THRESHOLD &&
            html_element.offsetHeight >= window.innerHeight * HW_THRESHOLD)
        prob += COVER_SIZE_PROB;

    /* Element has too much text */
    if(html_element.innerText && html_element.innerText.length > MAX_TEXT_LIMIT)
        prob -= LOTS_OF_TEXT_DAMAGE;

    return prob;
}


function findModalAndCovers(fast_mode=false){
    let possible_elements = [];

    /* Fast finding: Lets start by clicking on the middle of the screen and checking if there's a modal */
    if(fast_mode){
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;

        let e = elementFromPoint(x, y);
        if(getModalProb(e) <= MIN_MODAL_PROB - USER_ERROR_ALLOWED && getCoverProb(e) <= MIN_COVER_PROB - USER_ERROR_ALLOWED) return [];

        return [traverseUpwards(e, (e) => {getCoverProb(e) >= MIN_COVER_PROB})];
    }

    /* Slow finding: Iterate through all DOM elements, finding all possible modals */
    if(!fast_mode){
        let all_elements = document.body ? document.body.getElementsByTagName("*") : document.getElementsByTagName("*");
        for (let i = all_elements.length - 1; i--;){
            /* If a modal exists, climb upwards until you find the
             * last parent node that matches the coverProb */
            if(getModalProb(all_elements[i]) >= MIN_MODAL_PROB)
                possible_elements.push(traverseUpwards(
                    all_elements[i], (e) => {getCoverProb(e) >= MIN_COVER_PROB}));

            /* We're also obtaining covers */
            else if(getCoverProb(all_elements[i]) >= MIN_COVER_PROB)
                possible_elements.push(traverseUpwards(
                    all_elements[i], (e) => {getCoverProb(e) >= MIN_COVER_PROB}));

            /* We cannot delete the element at this point, as it would mess up the
             * order we're iterating the elements */
        }
    }

    return possible_elements;
}
