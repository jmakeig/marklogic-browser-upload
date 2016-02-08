'use strict'

const DEFAULT_LOCALE = 'en-US';

function firstKey(obj) { if(!obj) return; for(let k in obj) return k; }
function firstValue(obj) { if(!obj) return; for(let k in obj) return obj[k]; }

// TODO: Should `locale` be a function rather than a string, so the
// caller could specify her own formatter?
function _el(localname, classList, attrs, contents, locale) {
  if('select' === localname) {
    /* contents = [{ <value>: <label> }] */
    let value;
    if(attrs && attrs.value) {
      value = attrs.value;
      delete attrs.value;
    }
    if(contents) {
      contents = contents
        .map(opt => _el(
            'option',
            null,
            Object.assign(
              {value: firstKey(opt)},
              value === firstValue(opt) ? {selected: 'selected'} : {}
            ),
            firstValue(opt)
          )
        );
    }
  }
  let elem = document.createElement(localname || 'div');
  if('input' === localname) {
      switch(attrs.type) {
        case 'checkbox':
        case 'radio':
          elem.checked = Boolean(contents);
          break;
        case 'text':
        default:
          elem.value = String(contents);
      }
  } else if(contents instanceof HTMLElement) {
    elem.appendChild(contents);
  }
  else if((Array.isArray(contents) && contents[0] instanceof HTMLElement) || contents instanceof NodeList) {
    // <https://developer.mozilla.org/en-US/docs/Web/API/NodeList>
    Array.prototype.forEach.call(contents, function(item){
      elem.appendChild(item);
    });
  }
  else if('string' === typeof contents) {
    elem.textContent = contents;
  } else if('number' === typeof contents) {
    // console.warn('Using hard-coded locale.');
    elem.textContent = contents.toLocaleString(locale || DEFAULT_LOCALE); // FIXME: Get locale from model/store
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

export function div     (t, c, a, l) {return _el('div',    c, a, t, l);}
export function h1      (t, c, a, l) {return _el('h1',     c, a, t, l);}
export function h2      (t, c, a, l) {return _el('h2',     c, a, t, l);}
export function h3      (t, c, a, l) {return _el('h3',     c, a, t, l);}
export function a       (t, c, a, l) {return _el('a',      c, a, t, l);}
export function tr      (t, c, a, l) {return _el('tr',     c, a, t, l);}
export function td      (t, c, a, l) {return _el('td',     c, a, t, l);}
export function button  (t, c, a, l) {return _el('button', c, a, t, l);}
export function span    (t, c, a, l) {return _el('span',   c, a, t, l);}
export function p       (t, c, a, l) {return _el('p',      c, a, t, l);}
export function select  (t, c, a, l) {return _el('select', c, a, t, l);}
export function input   (t, c, a, l) {return _el('input',  c, Object.assign(a || {}, {type: 'text'}),     t, l);}
export function checkbox(t, c, a, l) {return _el('input',  c, Object.assign(a || {}, {type: 'checkbox'}), t, l);}
export function radio   (t, c, a, l) {return _el('input',  c, Object.assign(a || {}, {type: 'radio'}),    t, l);}

export function clear(el) {
  if(el.hasChildNodes) {
    while(el.hasChildNodes()) { el.removeChild(el.lastChild); }
  }
  return el;
}
