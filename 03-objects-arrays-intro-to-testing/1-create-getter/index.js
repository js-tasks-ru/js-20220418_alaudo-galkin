/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  function pickPart(string, part, separator = ".") {
    let parts = string.split(separator);
    if (part <= parts.length) {
      return parts[part];
    } else {
      return string;
    }
  }

  function skipParts(string, skipcount, separator = ".") {
    let parts = string.split(separator);
    if (skipcount < parts.length) {
      return (parts.filter((a, i) => i >= skipcount)).join(separator);
    }
  }

  function findProperty(path, object) {
    if (typeof object === 'object') {
      if (path.includes("."))
      {
        return findProperty(skipParts(path, 1), object[pickPart(path, 0)]); 
      }
      else
      {
        return object[path];
      }
    }
  }
    
  return findProperty.bind(undefined, path);
} 

