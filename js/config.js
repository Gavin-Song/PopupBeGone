/* Config variables */


/* --- User options --- */
const DEFAULT_SETTINGS = {
    on: true,
    whitelisted_pages: [],
    whitelisted_domains: ["google.com", "youtube.com"],
    fast_mode: false,
    run_at: "load1"
};


/* --- Modal prob data --- */
/* List of stuff like bad words in the HTML that hint
 * the element is a modal. Yes, a developer can easily bypass this
 * by renaming/rewording their modals, but then they'll have
 * bad code and weird language for their website */

/* Bad words that commonly appear in popups */
const BAD_MODAL_WORDS = [
    "sign me up",
    "newsletter",
    "email",
    "e-mail",
    "limited",
    "free",
    "subscribe",
    "ad block",
    "adblocker",
    "whitelist",
    "join",
    "enter",
    "win",
    "premium",
    "upgrade",
    "book",
    "buy",
    "sale",
    "offer",
    "offer end",
    "course",
    "$"
];

const BAD_MODAL_HTML_KEYWORDS = [
    "fa-close"
];

const GOOD_MODAL_KEYWORDS = [
    "login",
    "nav",
    "search",
    "upvote",
    "downvote",
    "like",
    "dislike",
    "vote",
    "log in",
    "home"
];

/* Likely = modals have this position: style
 * Maybe  = modals might have this position: style */
const MODAL_POSITIONS = {
    "likely" : ["fixed"],
    "maybe": ["relative", "absolute", "sticky"]
};

/* Most modals have this z-index or higher */
const MODAL_MIN_Z_INDEX = 100;

/* Bad keywords to have as classnames */
const BAD_MODAL_CLASS_NAMES = [
    "modal",
    "lightbox",
    "light-box",
    "light_box",
    "popup",
    "pop-up",
    "pop_up",
    "adblock",
    "ad_block",
    "ad-block",
    "survey",
    "fa-close",
    "overlay",
];

const GOOD_MODAL_WORD_PROB = -0.03;

/* Allowed tag names for modals (Aka they're not likely
 * to be modals) */
const ALLOWED_MODAL_TAGS = ["header", "nav", "script", "style", "a"];

/* Gain for properties that suggest it is a modal */
const BAD_WORD_PROB = 0.035;
const BAD_HTML_PROB = 0.03;
const MODAL_POSITION_LIKELY_PROB = 0.09;
const MODAL_POSITION_MAYBE_PROB = 0.04;
const MODAL_ACTION_PROB = 0.05;
const MODAL_Z_INDEX_PROB = 0.14;
const MODAL_BAD_CLASS_NAME_PROB = 0.13;

/* Min prob for it to be accepted as a modal */
const MIN_MODAL_PROB = 0.25;


/* --- Cover prob data --- */
/* List of stuff like bad words and HTML properties
 * the element is a cover. Yes, a developer can easily bypass this
 * by renaming/rewording their divs, but then they'll have
 * bad code! */

const FILTER_PROPERTIES = [
    "webkitFilter",
    "mozFilter",
    "oFilter",
    "msFilter",
    "filter"
];

const COVER_BLUR_PROB = 0.1;
const COVER_SIZE_PROB = 0.16;
const COVER_Z_INDEX_PROB = 0.08;
const COVER_NOT_SCROLLABLE_PROB = 0.08;
const HW_THRESHOLD = 0.9;
const LOTS_OF_TEXT_DAMAGE = 0.08;
const MAX_TEXT_LIMIT = 400; // Number of chars before prob goes down

const MIN_COVER_PROB = 0.25;
const USER_ERROR_ALLOWED = 0.04; // How much to lower the threshold if a user activates modal killing shortcut


/* --- Additional config for deleting --- */
/* Some modals we won't delete, beacuse they're likely too important
 * to the page structure. This section covers those cases */
const MAX_MODAL_CHILD_ELEMENTS = 200;
