export function prettyHash(hash) {
  if(!hash) return hash;
  const tokens = hash.split('-');
  if(tokens.length > 1) {
    return tokens[0] + '-…-' + tokens[tokens.length - 1];
  }
  return hash;
}

export function firstValue(obj) {
  if(!obj) return;
  for(let k in obj) {
    return obj[k];
  }
}
