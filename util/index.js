import { ReplaySubject } from 'rxjs';
import window from 'global';
import { CAPTCHA_SITE_KEY_V3, CAPTCHA_SITE_KEY_V2, MOBILE_MAX_WIDTH } from './constants';

export const scrollOptions = {
    smooth: true,
    delay: 300,
};

export const $gCaptchaResponseSubject = new ReplaySubject(null);
export const $gCaptchaResponseObs = $gCaptchaResponseSubject.asObservable();
export function captchaVerifyCallback(cresponse) {
    // console.log('captchaVerifyCallback fired ', window['grecaptcha'].getResponse());
    $gCaptchaResponseSubject.next(cresponse);
}
// var window;
window['captchaSiteKey'] = null;
window['onLoadCaptchaExplicitCallback'] = onLoadCaptchaExplicitHandler;
// For new way of implementation of captcha code test
// window.onload = function() {
//     window.grecaptcha.ready(function() {
//         console.log("google captcha ready event fired, rendering gRecaptchaElement")
//         window.grecaptcha.render("gRecaptchaElement", {
//           "sitekey": window['captchaSiteKey']
//         });
//       });
// };

export function onLoadCaptchaExplicitHandler() {
    // console.log('Captcha: onLoadCaptchaExplicitCallback callback fired');

    if (!window['grecaptcha']) {
        console.error('Not found grecaptcha object or g-recaptcha element not found ');
        return;
    }

    if (document.getElementById('gRecaptchaElement')) {
        window.grecaptcha.render('gRecaptchaElement', {
            sitekey: window['captchaSiteKey'],
            callback: captchaVerifyCallback,
        });
    }
};


export function reRenderCaptcha() {
    // console.log('Captcha: reRenderCaptcha callback fired');

    if (!window['grecaptcha']) {
        console.error('Not found grecaptcha object or g-recaptcha element not found ');
        return;
    }

    if (document.getElementById('gRecaptchaElement')) {
        window.grecaptcha.render('gRecaptchaElement', {
            sitekey: window['captchaSiteKey'],
            callback: captchaVerifyCallback,
        });
    }
};

export function removeCaptcha() {
    if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha && window.grecaptcha.reset) { grecaptcha.reset(); }
    // if (document.querySelector('[id*="gCaptchaDynamicScript_"]')) document.querySelector('[id*="gCaptchaDynamicScript_"]').remove();
}

export function reCaptchaInitialize(version) {
    // console.log('reCaptchaInitialize invoked!', version);

    const ver = version.toLowerCase();
    let renderScript;
    let siteKey = ver === 'v3' ? CAPTCHA_SITE_KEY_V3 : CAPTCHA_SITE_KEY_V2;

    //  Before new implemenation old way of loading v2 recaptcha on load of script
    renderScript = ver === 'v3' ?
        "https://www.google.com/recaptcha/api.js?render=" + siteKey : "https://www.google.com/recaptcha/api.js?onload=onLoadCaptchaExplicitCallback&render=explicit";

    // For new way of captcha implemenation logic
    // renderScript = ver === 'v3' ?
    //     "https://www.google.com/recaptcha/api.js?render=" + siteKey : "https://www.google.com/recaptcha/api.js";

    const dynamicScripts = [
        renderScript
    ];

    // For re-initialize captcha on different form switch on same page using dropdown option or link cliks (bascially in show hide scenario)
    if (document.querySelector('[id*="gCaptchaDynamicScript_"]')) document.querySelector('[id*="gCaptchaDynamicScript_"]').remove();
    // Before new implemenation
    // if (document.querySelector('[id*="gCaptchaDynamicScript_"]')) return;

    for (let i = 0; i < dynamicScripts.length; i++) {
        const node = document.createElement("script");
        node.id = 'gCaptchaDynamicScript_' + i;
        node.src = dynamicScripts[i];
        node.type = "text/javascript";
        node.async = true;
        node.defer = true;
        node.charset = "utf-8";
        node.onload = () => {
            $gCaptchaResponseSubject.next(null);
            if (!window['captchaSiteKey']) window['captchaSiteKey'] = siteKey;
        }

        document.getElementsByTagName("head")[0].appendChild(node);

    }
}

export const resetCaptcha = (eleName) => {
    if (window.grecaptcha && document.getElementById(eleName)) window.grecaptcha.reset();
}

export const verifyCaptcha = (eleName) => {

    let isValid = false;
    let resp = null;
    // this.recaptchaErrorFlag = false;

    $gCaptchaResponseObs.subscribe((resp) => {

        if (resp) {
            // console.log('captcha response received! ', resp);
            // this.recaptchaErrorFlag = false;
            isValid = true;
            resp = resp;
            // console.log((document.getElementById(eleName)));
            if (document.getElementById(eleName)) document.getElementById(eleName).value = resp;
        } else {
            // console.error('captcha response error! ', resp );
            // this.recaptchaErrorFlag = true;
            isValid = false;
            if (document.getElementById(eleName)) document.getElementById(eleName).value = resp;
        }
    },
        err => console.error('captcha response error! ', err)
    );

    return { resp, isValid };
}

export const isMobileDevice = () => {
    // console.log(' (window.outerWidth <= MOBILE_MAX_WIDTH)',  window.outerWidth , (window.outerWidth <= MOBILE_MAX_WIDTH));
    // return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    //return (window.outerWidth <= MOBILE_MAX_WIDTH) || (navigator.userAgent.indexOf('IEMobile') !== -1);
    return (window.outerWidth <= MOBILE_MAX_WIDTH);
};

export const getCookie = (cname) => {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function normalizeDate(date) {
    // $date example "20191125" / "YYYYMMDD"
    // use to convert $date into "2019-11-25" / "YYYY-MM-DD"

    if (!date) return
    // console.log('normalizeDate()', date, `${date.substr(0,4)}-${date.substr(4,2)}-${date.substr(6,2)}`)
    return `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`;
}

export function isTextFound(name, searchText) {
    // console.log('name ', name);

    if (name && name.length) {
        const serverTextMatch = name ? name.search(searchText) : -1;
        if (serverTextMatch !== -1) {
            // console.log('match found');
            return false;
        } else {
            // console.log('not found');
            return true;
        }
    }
}

export const saveDataToLocalStorage = payload => {
    if (!payload || !payload.key || !payload.data) {
        console.error('No key or data property found in payload to save data to localStorage');
        return;
    }

    const { key, data } = payload;
    localStorage.setItem(key, JSON.stringify(data))
}

export const getLocalStorageData = key => {
    if (!key) {
        console.error("key not set in payload, to fetch from localStorage");
        return;
    }

    if (localStorage.getItem(key) && localStorage.getItem(key) !== '') {
        return JSON.parse(localStorage.getItem(key));
    }
}