;(function(){

    // CommonJS require()
    
    function require(p){
        var path = require.resolve(p)
          , mod = require.modules[path];
        if (!mod) throw new Error('failed to require "' + p + '"');
        if (!mod.exports) {
          mod.exports = {};
          mod.call(mod.exports, mod, mod.exports, require.relative(path));
        }
        return mod.exports;
      }
    
    require.modules = {};
    
    require.resolve = function (path){
        var orig = path
          , reg = path + '.js'
          , index = path + '/index.js';
        return require.modules[reg] && reg
          || require.modules[index] && index
          || orig;
      };
    
    require.register = function (path, fn){
        require.modules[path] = fn;
      };
    
    require.relative = function (parent) {
        return function(p){
          if ('.' != p.charAt(0)) return require(p);
    
          var path = parent.split('/')
            , segs = p.split('/');
          path.pop();
    
          for (var i = 0; i < segs.length; i++) {
            var seg = segs[i];
            if ('..' == seg) path.pop();
            else if ('.' != seg) path.push(seg);
          }
    
          return require(path.join('/'));
        };
      };
    
    
    require.register("browser/debug.js", function(module, exports, require){
    
    module.exports = function(type){
      return function(){
      }
    };
    
    }); // module: browser/debug.js
    
    require.register("browser/diff.js", function(module, exports, require){
    /* See LICENSE file for terms of use */
    
    /*
     * Text diff implementation.
     *
     * This library supports the following APIS:
     * JsDiff.diffChars: Character by character diff
     * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
     * JsDiff.diffLines: Line based diff
     *
     * JsDiff.diffCss: Diff targeted at CSS content
     *
     * These methods are based on the implementation proposed in
     * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
     * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
     */
    var JsDiff = (function() {
      /*jshint maxparams: 5*/
      function clonePath(path) {
        return { newPos: path.newPos, components: path.components.slice(0) };
      }
      function removeEmpty(array) {
        var ret = [];
        for (var i = 0; i < array.length; i++) {
          if (array[i]) {
            ret.push(array[i]);
          }
        }
        return ret;
      }
      function escapeHTML(s) {
        var n = s;
        n = n.replace(/&/g, '&amp;');
        n = n.replace(/</g, '&lt;');
        n = n.replace(/>/g, '&gt;');
        n = n.replace(/"/g, '&quot;');
    
        return n;
      }
    
      var Diff = function(ignoreWhitespace) {
        this.ignoreWhitespace = ignoreWhitespace;
      };
      Diff.prototype = {
          diff: function(oldString, newString) {
            // Handle the identity case (this is due to unrolling editLength == 0
            if (newString === oldString) {
              return [{ value: newString }];
            }
            if (!newString) {
              return [{ value: oldString, removed: true }];
            }
            if (!oldString) {
              return [{ value: newString, added: true }];
            }
    
            newString = this.tokenize(newString);
            oldString = this.tokenize(oldString);
    
            var newLen = newString.length, oldLen = oldString.length;
            var maxEditLength = newLen + oldLen;
            var bestPath = [{ newPos: -1, components: [] }];
    
            // Seed editLength = 0
            var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
            if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {
              return bestPath[0].components;
            }
    
            for (var editLength = 1; editLength <= maxEditLength; editLength++) {
              for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {
                var basePath;
                var addPath = bestPath[diagonalPath-1],
                    removePath = bestPath[diagonalPath+1];
                oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
                if (addPath) {
                  // No one else is going to attempt to use this value, clear it
                  bestPath[diagonalPath-1] = undefined;
                }
    
                var canAdd = addPath && addPath.newPos+1 < newLen;
                var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
                if (!canAdd && !canRemove) {
                  bestPath[diagonalPath] = undefined;
                  continue;
                }
    
                // Select the diagonal that we want to branch from. We select the prior
                // path whose position in the new string is the farthest from the origin
                // and does not pass the bounds of the diff graph
                if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
                  basePath = clonePath(removePath);
                  this.pushComponent(basePath.components, oldString[oldPos], undefined, true);
                } else {
                  basePath = clonePath(addPath);
                  basePath.newPos++;
                  this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined);
                }
    
                var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);
    
                if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {
                  return basePath.components;
                } else {
                  bestPath[diagonalPath] = basePath;
                }
              }
            }
          },
    
          pushComponent: function(components, value, added, removed) {
            var last = components[components.length-1];
            if (last && last.added === added && last.removed === removed) {
              // We need to clone here as the component clone operation is just
              // as shallow array clone
              components[components.length-1] =
                {value: this.join(last.value, value), added: added, removed: removed };
            } else {
              components.push({value: value, added: added, removed: removed });
            }
          },
          extractCommon: function(basePath, newString, oldString, diagonalPath) {
            var newLen = newString.length,
                oldLen = oldString.length,
                newPos = basePath.newPos,
                oldPos = newPos - diagonalPath;
            while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {
              newPos++;
              oldPos++;
    
              this.pushComponent(basePath.components, newString[newPos], undefined, undefined);
            }
            basePath.newPos = newPos;
            return oldPos;
          },
    
          equals: function(left, right) {
            var reWhitespace = /\S/;
            if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {
              return true;
            } else {
              return left === right;
            }
          },
          join: function(left, right) {
            return left + right;
          },
          tokenize: function(value) {
            return value;
          }
      };
    
      var CharDiff = new Diff();
    
      var WordDiff = new Diff(true);
      var WordWithSpaceDiff = new Diff();
      WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {
        return removeEmpty(value.split(/(\s+|\b)/));
      };
    
      var CssDiff = new Diff(true);
      CssDiff.tokenize = function(value) {
        return removeEmpty(value.split(/([{}:;,]|\s+)/));
      };
    
      var LineDiff = new Diff();
      LineDiff.tokenize = function(value) {
        var retLines = [],
            lines = value.split(/^/m);
    
        for(var i = 0; i < lines.length; i++) {
          var line = lines[i],
              lastLine = lines[i - 1];
    
          // Merge lines that may contain windows new lines
          if (line == '\n' && lastLine && lastLine[lastLine.length - 1] === '\r') {
            retLines[retLines.length - 1] += '\n';
          } else if (line) {
            retLines.push(line);
          }
        }
    
        return retLines;
      };
    
      return {