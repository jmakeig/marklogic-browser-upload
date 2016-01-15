'use strict'

function _el(localname, classList, attrs, contents) {
  var elem = document.createElement(localname || 'div');
  if('string' === typeof contents) {
    elem.textContent = contents;
  } else if('number' === typeof contents) {
    console.warn('Using hard-coded locale.');
    elem.textContent = contents.toLocaleString('en-us'); // FIXME: Get locale from model/store
  }
  else if(contents instanceof HTMLElement) {
    elem.appendChild(contents);
  }
  else if((Array.isArray(contents) && contents[0] instanceof HTMLElement) || contents instanceof NodeList) {
    // <https://developer.mozilla.org/en-US/docs/Web/API/NodeList>
    Array.prototype.forEach.call(contents, function(item){
      elem.appendChild(item);
    });
  }
  if(classList) {
    if('string' === typeof classList) { classList = [classList]; }
    classList.forEach(function(cls){
      elem.classList.add(cls);
    });
  }
  if(attrs) {
    for(let key in attrs) {
      elem.setAttribute(key, attrs[key]);
    }
  }
  return elem;
}
export function div   (t, c, a) {return _el('div',    c, a, t);}
export function h1    (t, c, a) {return _el('h1',     c, a, t);}
export function h2    (t, c, a) {return _el('h2',     c, a, t);}
export function h3    (t, c, a) {return _el('h3',     c, a, t);}
export function tr    (t, c, a) {return _el('tr',     c, a, t);}
export function td    (t, c, a) {return _el('td',     c, a, t);}
export function button(t, c, a) {return _el('button', c, a, t);}
export function span  (t, c, a) {return _el('span',   c, a, t);}
export function p     (t, c, a) {return _el('p',      c, a, t);}
