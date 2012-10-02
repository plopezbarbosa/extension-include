/* By Devin Rhode (devinrhode2@gmail.com)
 * General use functions for Chrome extensions!
 */
/*jslint nomen: true, vars: true, white: true, browser: true, devel: true */


//local globals:
var getClass, getId, getTag, GET, POST, fail, log, warn, error, trackEvent, storageDefault, createElement, runInPage, nodeReady;
(function extensionInclude() {
'use strict';	

getClass = function getClass(elements) {
  return document.getElementsByClassName(elements);
};
getId = function getId(elements) {
  return document.getElementById(elements);
};
getTag = function getTag(elements) {
  return document.getElementsByTagName(elements);
};
HTMLElement.prototype.getClass = HTMLElement.prototype.getElementsByClassName;
HTMLElement.prototype.getId = HTMLElement.prototype.getElementById;
HTMLElement.prototype.getTag = HTMLElement.prototype.getElementsByTagName;

String.prototype.contains = function StringContains(string) {
  return this.indexOf(string) > -1;
};

var ajaxSend = function(url, callback, method, args) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.onreadystatechange = function XHROnReadyStateChange() {
    if(xhr.readyState === 4) {
      callback(xhr.responseText, xhr);
    }
  };
  if(method === 'POST') {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }
  xhr.send(args);
};
POST = function POST(url, callback,         args) {
            ajaxSend(url, callback, 'POST', args);
};

GET = function GET(url, callback) {
          ajaxSend(url, callback, 'GET');
};

var masterHistory = function masterHistory() {
  //have a master switch on caller.name === 'f' (log) || 'warn' || 'fail' || 'error'
};

//fail, program cannot continue. Alert a message, and kill it
fail = function fail(message) {
  masterHistory(arguments);
  alert(message);
  throw new Error(message);
};

//from HTML5 boilerplate. Paul Irish is awesome. I have no idea why the function name is 'f'...
log = function f() {
  masterHistory(arguments);
  if (typeof debug !== 'undefined' && debug) {
    if (typeof console !== 'undefined') { // with if (this.console) I was getting "Uncaught TypeError: Cannot read property 'console' of undefined"
      var args = arguments;
      var newarr;
  
      try {
        args.callee = f.caller;
      } catch(e) {
        
      }
  
      newarr = [].slice.call(args);
  
      if (typeof console.log === 'object') {
        log.apply.call(console.log, console, newarr);
      } else {
        console.log.apply(console, newarr);
      }
    }
  }
};


//Some common pitfall that is handled. Application will continue fine.
warn = function warn(message) {
  masterHistory(arguments);
  debug && console.warn(message);
  return message;
};
//some error where the program will continue, but this scenario really shouldn't be occuring
error = function error(message) {
  masterHistory(arguments);
  debug && console.error(message);
  return message;
};

//KISSmetrics
trackEvent = function trackEvent() {
  if (typeof _kmq === 'undefined') {
    window._kmq = [];
  }
  var argsArray = [].slice.call(arguments);
  if (argsArray.length === 1) {
    _kmq.push(['record', argsArray[0].replace(/\s/gi, '_')]);
  } else {
    _kmq.push(argsArray);
  }
};

storageDefault = function storageDefault(arg1, arg2) {
  if (typeof arg1 === 'string') {
    if (localStorage.getItem(arg1) === null) {
      localStorage.setItem(arg1, arg2);
    }
  } else if (typeof arg1 === 'object') {
    for (var key in arg1) {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(arg1, arg1[key]);
      }
    }
  } else {
    fail('storageDefault expects an object or 2 string arguments');
  }
};


//coolest method ever!
createElement = function createElement(element, props, attributes) {
  element = document.createElement(element);
  if (typeof props !== 'undefined') {
    for (var prop in props) {
      element[prop] = props[prop];
    }
    if (typeof attributes !== 'undefined') {
      for (var attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
      }
    }
  }
  return element;
};

/**
 * guardedParse - protected JSON.parse
 * assumes JSON.parse is defined
 */
JSON.guardedParse = function guardedParse(string) {
  var returnValue = {};
  try {
    if (string.indexOf('{') === 0 && string.charAt(string.length - 1) === '}') {
      returnValue = JSON.parse(string);
    } else {
      console.log('first and last characters are not { and }. returning false');
      returnValue = false;
    }
  } catch(e) {
    alert('BAD JSON: ' + string);
    console.error('CAUGHT ERROR! ->', e);
    returnValue = false;
  }
  return returnValue;
};


//very extension specific:
/**
 * runInPage - run a peice of javascript in the context of the page's DOM, not an isolated world
 */
runInPage = function runInPage() {
  var script = createElement('script', {innerHTML: ''});
  for (var task in arguments) {
    if (typeof arguments[task] === 'string') {
      script.innerHTML += arguments[task];
    } else if (typeof arguments[task] === 'function') {
      script.innerHTML += '(' + arguments[task] + '())';
    }
  }
  try {
    document.documentElement.appendChild(script);
    //could do: script.removeNode(true);
  } catch (e) {
    console.error('CAUGHT ERROR: ', e, 'on:', script.innerHTML);
  }
};

/**
 * node-ready 
 * See https://github.com/devinrhode2/node-ready
 * Send questions/problems/critiques on code to: DevinRhode2@gmail.com (put "skywalker.js" in the title)
 */

nodeReady = function nodeReady(call, readyCallback, timeout) {
  var box = typeof call; //box is our one and only var!
  if (box === 'string') {
    try {
      //breakup each dot, checking if (item) then going item.next, which recursively becomes item
      //or lean on try/catch more to simply re-try all da time.
      box = eval(call); //strict mode ('use strict') restricts eval in some fashion...
    } catch (e) {
      if (e instanceof EvalError) {
        console.error('EvalError on call:'+call+' :( try passing in a function'+
        ' like: \nnodeReady(function(){return '+call+';}, callback);', e);
      } else {
        console.error('non-EvalError when executing call:'+call+' :(', e);        
      }
    }
  } else if (box === 'function') {
    box = call();
  } else {
    box = 'At this time, nodeReady only accepts a string javascript call or '+
          'function for the first argument, and the callback for the second argument.';
    alert(box);
    throw box;
  }
  //box is either eval(call) or call()
  if (box) {
    readyCallback(box);
  } else {
    if (typeof timeout === 'undefined') {
      timeout = 40;
    }
    
    setTimeout(function nodeReadyMainTimeoutCallback(){
      nodeReady(call, readyCallback);
    }, timeout);
  }
};

}());