(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.chai = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    module.exports = require('./lib/chai');
    
    },{"./lib/chai":2}],2:[function(require,module,exports){
    /*!
     * chai
     * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */
    
    var used = [];
    
    /*!
     * Chai version
     */
    
    exports.version = '4.2.0';
    
    /*!
     * Assertion Error
     */
    
    exports.AssertionError = require('assertion-error');
    
    /*!
     * Utils for plugins (not exported)
     */
    
    var util = require('./chai/utils');
    
    /**
     * # .use(function)
     *
     * Provides a way to extend the internals of Chai.
     *
     * @param {Function}
     * @returns {this} for chaining
     * @api public
     */
    
    exports.use = function (fn) {
      if (!~used.indexOf(fn)) {
        fn(exports, util);
        used.push(fn);
      }
    
      return exports;
    };
    
    /*!
     * Utility Functions
     */
    
    exports.util = util;
    
    /*!
     * Configuration
     */
    
    var config = require('./chai/config');
    exports.config = config;
    
    /*!
     * Primary `Assertion` prototype
     */
    
    var assertion = require('./chai/assertion');
    exports.use(assertion);
    
    /*!
     * Core Assertions
     */
    
    var core = require('./chai/core/assertions');
    exports.use(core);
    
    /*!
     * Expect interface
     */
    
    var expect = require('./chai/interface/expect');
    exports.use(expect);
    
    /*!
     * Should interface
     */
    
    var should = require('./chai/interface/should');
    exports.use(should);
    
    /*!
     * Assert interface
     */
    
    var assert = require('./chai/interface/assert');
    exports.use(assert);
    
    },{"./chai/assertion":3,"./chai/config":4,"./chai/core/assertions":5,"./chai/interface/assert":6,"./chai/interface/expect":7,"./chai/interface/should":8,"./chai/utils":22,"assertion-error":33}],3:[function(require,module,exports){
    /*!
     * chai
     * http://chaijs.com
     * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */
    
    var config = require('./config');
    
    module.exports = function (_chai, util) {
      /*!
       * Module dependencies.
       */
    
      var AssertionError = _chai.AssertionError
        , flag = util.flag;
    
      /*!
       * Module export.
       */
    
      _chai.Assertion = Assertion;
    
      /*!
       * Assertion Constructor
       *
       * Creates object for chaining.
       *
       * `Assertion` objects contain metadata in the form of flags. Three flags can
       * be assigned during instantiation by passing arguments to this constructor:
       *
       * - `object`: This flag contains the target of the assertion. For example, in
       *   the assertion `expect(numKittens).to.equal(7);`, the `object` flag will
       *   contain `numKittens` so that the `equal` assertion can reference it when
       *   needed.
       *
       * - `message`: This flag contains an optional custom error message to be
       *   prepended to the error message that's generated by the assertion when it
       *   fails.
       *
       * - `ssfi`: This flag stands for "start stack function indicator". It
       *   contains a function reference that serves as the starting point for
       *   removing frames from the stack trace of the error that's created by the
       *   assertion when it fails. The goal is to provide a cleaner stack trace to
       *   end users by removing Chai's internal functions. Note that it only works
       *   in environments that support `Error.captureStackTrace`, and only when
       *   `Chai.config.includeStack` hasn't been set to `false`.
       *
       * - `lockSsfi`: This flag controls whether or not the given `ssfi` flag
       *   should retain its current value, even as assertions are chained off of
       *   this object. This is usually set to `true` when creating a new assertion
       *   from within another assertion. It's also temporarily set to `true` before
       *   an overwritten assertion gets called by the overwriting assertion.
       *
       * @param {Mixed} obj target of the assertion
       * @param {String} msg (optional) custom error message
       * @param {Function} ssfi (optional) starting point for removing stack frames
       * @param {Boolean} lockSsfi (optional) whether or not the ssfi flag is locked
       * @api private
       */
    
      function Assertion (obj, msg, ssfi, lockSsfi) {
        flag(this, 'ssfi', ssfi || Assertion);
        flag(this, 'lockSsfi', lockSsfi);
        flag(this, 'object', obj);
        flag(this, 'message', msg);
    
        return util.proxify(this);
      }
    
      Object.defineProperty(Assertion, 'includeStack', {
        get: function() {
          console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
          return config.includeStack;
        },
        set: function(value) {
          console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
          config.includeStack = value;
        }
      });
    
      Object.defineProperty(Assertion, 'showDiff', {
        get: function() {
          console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
          return config.showDiff;
        },
        set: function(value) {
          console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
          config.showDiff = value;
        }
      });
    
      Assertion.addProperty = function (name, fn) {
        util.addProperty(this.prototype, name, fn);
      };
    
      Assertion.addMethod = function (name, fn) {
        util.addMethod(this.prototype, name, fn);
      };
    
      Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
        util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
      };
    
      Assertion.overwriteProperty = function (name, fn) {
        util.overwriteProperty(this.prototype, name, fn);
      };
    
      Assertion.overwriteMethod = function (name, fn) {
        util.overwriteMethod(this.prototype, name, fn);
      };
    
      Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {
        util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
      };
    
      /**
       * ### .assert(expression, message, negateMessage, expected, actual, showDiff)
       *
       * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
       *
       * @name assert
       * @param {Philosophical} expression to be tested
       * @param {String|Function} message or function that returns message to display if expression fails
       * @param {String|Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
       * @param {Mixed} expected value (remember to check for negation)
       * @param {Mixed} actual (optional) will default to `this.obj`
       * @param {Boolean} showDiff (optional) when set to `true`, assert will display a diff in addition to the message if expression fails
       * @api private
       */
    
      Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
        var ok = util.test(this, arguments);
        if (false !== showDiff) showDiff = true;
        if (undefined === expected && undefined === _actual) showDiff = false;
        if (true !== config.showDiff) showDiff = false;
    
        if (!ok) {
          msg = util.getMessage(this, arguments);
          var actual = util.getActual(this, arguments);
          throw new AssertionError(msg, {
              actual: actual
            , expected: expected
            , showDiff: showDiff
          }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
        }
      };
    
      /*!
       * ### ._obj
       *
       * Quick reference to stored `actual` value for plugin developers.
       *
       * @api private
       */
    
      Object.defineProperty(Assertion.prototype, '_obj',
        { get: function () {
            return flag(this, 'object');
          }
        , set: function (val) {
            flag(this, 'object', val);
          }
      });
    };
    
    },{"./config":4}],4:[function(require,module,exports){
    module.exports = {
    
      /**
       * ### config.includeStack
       *
       * User configurable property, influences whether stack trace
       * is included in Assertion error message. Default of false
       * suppresses stack trace in the error message.
       *
       *     chai.config.includeStack = true;  // enable stack on error
       *
       * @param {Boolean}
       * @api public
       */
    
      includeStack: false,
    
      /**
       * ### config.showDiff
       *
       * User configurable property, influences whether or not
       * the `showDiff` flag should be included in the thrown
       * AssertionErrors. `false` will always be `false`; `true`
       * will be true when the assertion has requested a diff
       * be shown.
       *
       * @param {Boolean}
       * @api public
       */
    
      showDiff: true,
    
      /**
       * ### config.truncateThreshold
       *
       * User configurable property, sets length threshold for actual and
       * expected values in assertion errors. If this threshold is exceeded, for
       * example for large data structures, the value is replaced with something
       * like `[ Array(3) ]` or `{ Object (prop1, prop2) }`.
       *
       * Set it to zero if you want to disable truncating altogether.
       *
       * This is especially userful when doing assertions on arrays: having this
       * set to a reasonable large value makes the failure messages readily
       * inspectable.
       *
       *     chai.config.truncateThreshold = 0;  // disable truncating
       *
       * @param {Number}
       * @api public
       */
    
      truncateThreshold: 40,
    
      /**
       * ### config.useProxy
       *
       * User configurable property, defines if chai will use a Proxy to throw
       * an error when a non-existent property is read, which protects users
       * from typos when using property-based assertions.
       *
       * Set it to false if you want to disable this feature.
       *
       *     chai.config.useProxy = false;  // disable use of Proxy
       *
       * This feature is automatically disabled regardless of this config value
       * in environments that don't support proxies.
       *
       * @param {Boolean}
       * @api public
       */
    
      useProxy: true,
    
      /**
       * ### config.proxyExcludedKeys
       *
       * User configurable property, defines which properties should be ignored
       * instead of throwing an error if they do not exist on the assertion.
       * This is only applied if the environment Chai is running in supports proxies and
       * if the `useProxy` configuration setting is enabled.
       * By default, `then` and `inspect` will not throw an error if they do not exist on the
       * assertion object because the `.inspect` property is read by `util.inspect` (for example, when
       * using `console.log` on the assertion object) and `.then` is necessary for promise type-checking.
       *
       *     // By default these keys will not throw an error if they do not exist on the assertion object
       *     chai.config.proxyExcludedKeys = ['then', 'inspect'];
       *
       * @param {Array}
       * @api public
       */
    
      proxyExcludedKeys: ['then', 'catch', 'inspect', 'toJSON']
    };
    
    },{}],5:[function(require,module,exports){
    /*!
     * chai
     * http://chaijs.com
     * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */
    
    module.exports = function (chai, _) {
      var Assertion = chai.Assertion
        , AssertionError = chai.AssertionError
        , flag = _.flag;
    
      /**
       * ### Language Chains
       *
       * The following are provided as chainable getters to improve the readability
       * of your assertions.
       *
       * **Chains**
       *
       * - to
       * - be
       * - been
       * - is
       * - that
       * - which
       * - and
       * - has
       * - have
       * - with
       * - at
       * - of
       * - same
       * - but
       * - does
       * - still
       *
       * @name language chains
       * @namespace BDD
       * @api public
       */
    
      [ 'to', 'be', 'been', 'is'
      , 'and', 'has', 'have', 'with'
      , 'that', 'which', 'at', 'of'
      , 'same', 'but', 'does', 'still' ].forEach(function (chain) {
        Assertion.addProperty(chain);
      });
    
      /**
       * ### .not
       *
       * Negates all assertions that follow in the chain.
       *
       *     expect(function () {}).to.not.throw();
       *     expect({a: 1}).to.not.have.property('b');
       *     expect([1, 2]).to.be.an('array').that.does.not.include(3);
       *
       * Just because you can negate any assertion with `.not` doesn't mean you
       * should. With great power comes great responsibility. It's often best to
       * assert that the one expected output was produced, rather than asserting
       * that one of countless unexpected outputs wasn't produced. See individual
       * assertions for specific guidance.
       *
       *     expect(2).to.equal(2); // Recommended
       *     expect(2).to.not.equal(1); // Not recommended
       *
       * @name not
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('not', function () {
        flag(this, 'negate', true);
      });
    
      /**
       * ### .deep
       *
       * Causes all `.equal`, `.include`, `.members`, `.keys`, and `.property`
       * assertions that follow in the chain to use deep equality instead of strict
       * (`===`) equality. See the `deep-eql` project page for info on the deep
       * equality algorithm: https://github.com/chaijs/deep-eql.
       *
       *     // Target object deeply (but not strictly) equals `{a: 1}`
       *     expect({a: 1}).to.deep.equal({a: 1});
       *     expect({a: 1}).to.not.equal({a: 1});
       *
       *     // Target array deeply (but not strictly) includes `{a: 1}`
       *     expect([{a: 1}]).to.deep.include({a: 1});
       *     expect([{a: 1}]).to.not.include({a: 1});
       *
       *     // Target object deeply (but not strictly) includes `x: {a: 1}`
       *     expect({x: {a: 1}}).to.deep.include({x: {a: 1}});
       *     expect({x: {a: 1}}).to.not.include({x: {a: 1}});
       *
       *     // Target array deeply (but not strictly) has member `{a: 1}`
       *     expect([{a: 1}]).to.have.deep.members([{a: 1}]);
       *     expect([{a: 1}]).to.not.have.members([{a: 1}]);
       *
       *     // Target set deeply (but not strictly) has key `{a: 1}`
       *     expect(new Set([{a: 1}])).to.have.deep.keys([{a: 1}]);
       *     expect(new Set([{a: 1}])).to.not.have.keys([{a: 1}]);
       *
       *     // Target object deeply (but not strictly) has property `x: {a: 1}`
       *     expect({x: {a: 1}}).to.have.deep.property('x', {a: 1});
       *     expect({x: {a: 1}}).to.not.have.property('x', {a: 1});
       *
       * @name deep
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('deep', function () {
        flag(this, 'deep', true);
      });
    
      /**
       * ### .nested
       *
       * Enables dot- and bracket-notation in all `.property` and `.include`
       * assertions that follow in the chain.
       *
       *     expect({a: {b: ['x', 'y']}}).to.have.nested.property('a.b[1]');
       *     expect({a: {b: ['x', 'y']}}).to.nested.include({'a.b[1]': 'y'});
       *
       * If `.` or `[]` are part of an actual property name, they can be escaped by
       * adding two backslashes before them.
       *
       *     expect({'.a': {'[b]': 'x'}}).to.have.nested.property('\\.a.\\[b\\]');
       *     expect({'.a': {'[b]': 'x'}}).to.nested.include({'\\.a.\\[b\\]': 'x'});
       *
       * `.nested` cannot be combined with `.own`.
       *
       * @name nested
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('nested', function () {
        flag(this, 'nested', true);
      });
    
      /**
       * ### .own
       *
       * Causes all `.property` and `.include` assertions that follow in the chain
       * to ignore inherited properties.
       *
       *     Object.prototype.b = 2;
       *
       *     expect({a: 1}).to.have.own.property('a');
       *     expect({a: 1}).to.have.property('b');
       *     expect({a: 1}).to.not.have.own.property('b');
       *
       *     expect({a: 1}).to.own.include({a: 1});
       *     expect({a: 1}).to.include({b: 2}).but.not.own.include({b: 2});
       *
       * `.own` cannot be combined with `.nested`.
       *
       * @name own
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('own', function () {
        flag(this, 'own', true);
      });
    
      /**
       * ### .ordered
       *
       * Causes all `.members` assertions that follow in the chain to require that
       * members be in the same order.
       *
       *     expect([1, 2]).to.have.ordered.members([1, 2])
       *       .but.not.have.ordered.members([2, 1]);
       *
       * When `.include` and `.ordered` are combined, the ordering begins at the
       * start of both arrays.
       *
       *     expect([1, 2, 3]).to.include.ordered.members([1, 2])
       *       .but.not.include.ordered.members([2, 3]);
       *
       * @name ordered
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('ordered', function () {
        flag(this, 'ordered', true);
      });
    
      /**
       * ### .any
       *
       * Causes all `.keys` assertions that follow in the chain to only require that
       * the target have at least one of the given keys. This is the opposite of
       * `.all`, which requires that the target have all of the given keys.
       *
       *     expect({a: 1, b: 2}).to.not.have.any.keys('c', 'd');
       *
       * See the `.keys` doc for guidance on when to use `.any` or `.all`.
       *
       * @name any
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('any', function () {
        flag(this, 'any', true);
        flag(this, 'all', false);
      });
    
      /**
       * ### .all
       *
       * Causes all `.keys` assertions that follow in the chain to require that the
       * target have all of the given keys. This is the opposite of `.any`, which
       * only requires that the target have at least one of the given keys.
       *
       *     expect({a: 1, b: 2}).to.have.all.keys('a', 'b');
       *
       * Note that `.all` is used by default when neither `.all` nor `.any` are
       * added earlier in the chain. However, it's often best to add `.all` anyway
       * because it improves readability.
       *
       * See the `.keys` doc for guidance on when to use `.any` or `.all`.
       *
       * @name all
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('all', function () {
        flag(this, 'all', true);
        flag(this, 'any', false);
      });
    
      /**
       * ### .a(type[, msg])
       *
       * Asserts that the target's type is equal to the given string `type`. Types
       * are case insensitive. See the `type-detect` project page for info on the
       * type detection algorithm: https://github.com/chaijs/type-detect.
       *
       *     expect('foo').to.be.a('string');
       *     expect({a: 1}).to.be.an('object');
       *     expect(null).to.be.a('null');
       *     expect(undefined).to.be.an('undefined');
       *     expect(new Error).to.be.an('error');
       *     expect(Promise.resolve()).to.be.a('promise');
       *     expect(new Float32Array).to.be.a('float32array');
       *     expect(Symbol()).to.be.a('symbol');
       *
       * `.a` supports objects that have a custom type set via `Symbol.toStringTag`.
       *
       *     var myObj = {
       *       [Symbol.toStringTag]: 'myCustomType'
       *     };
       *
       *     expect(myObj).to.be.a('myCustomType').but.not.an('object');
       *
       * It's often best to use `.a` to check a target's type before making more
       * assertions on the same target. That way, you avoid unexpected behavior from
       * any assertion that does different things based on the target's type.
       *
       *     expect([1, 2, 3]).to.be.an('array').that.includes(2);
       *     expect([]).to.be.an('array').that.is.empty;
       *
       * Add `.not` earlier in the chain to negate `.a`. However, it's often best to
       * assert that the target is the expected type, rather than asserting that it
       * isn't one of many unexpected types.
       *
       *     expect('foo').to.be.a('string'); // Recommended
       *     expect('foo').to.not.be.an('array'); // Not recommended
       *
       * `.a` accepts an optional `msg` argument which is a custom error message to
       * show when the assertion fails. The message can also be given as the second
       * argument to `expect`.
       *
       *     expect(1).to.be.a('string', 'nooo why fail??');
       *     expect(1, 'nooo why fail??').to.be.a('string');
       *
       * `.a` can also be used as a language chain to improve the readability of
       * your assertions.
       *
       *     expect({b: 2}).to.have.a.property('b');
       *
       * The alias `.an` can be used interchangeably with `.a`.
       *
       * @name a
       * @alias an
       * @param {String} type
       * @param {String} msg _optional_
       * @namespace BDD
       * @api public
       */
    
      function an (type, msg) {
        if (msg) flag(this, 'message', msg);
        type = type.toLowerCase();
        var obj = flag(this, 'object')
          , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';
    
        this.assert(
            type === _.type(obj).toLowerCase()
          , 'expected #{this} to be ' + article + type
          , 'expected #{this} not to be ' + article + type
        );
      }
    
      Assertion.addChainableMethod('an', an);
      Assertion.addChainableMethod('a', an);
    
      /**
       * ### .include(val[, msg])
       *
       * When the target is a string, `.include` asserts that the given string `val`
       * is a substring of the target.
       *
       *     expect('foobar').to.include('foo');
       *
       * When the target is an array, `.include` asserts that the given `val` is a
       * member of the target.
       *
       *     expect([1, 2, 3]).to.include(2);
       *
       * When the target is an object, `.include` asserts that the given object
       * `val`'s properties are a subset of the target's properties.
       *
       *     expect({a: 1, b: 2, c: 3}).to.include({a: 1, b: 2});
       *
       * When the target is a Set or WeakSet, `.include` asserts that the given `val` is a
       * member of the target. SameValueZero equality algorithm is used.
       *
       *     expect(new Set([1, 2])).to.include(2);
       *
       * When the target is a Map, `.include` asserts that the given `val` is one of
       * the values of the target. SameValueZero equality algorithm is used.
       *
       *     expect(new Map([['a', 1], ['b', 2]])).to.include(2);
       *
       * Because `.include` does different things based on the target's type, it's
       * important to check the target's type before using `.include`. See the `.a`
       * doc for info on testing a target's type.
       *
       *     expect([1, 2, 3]).to.be.an('array').that.includes(2);
       *
       * By default, strict (`===`) equality is used to compare array members and
       * object properties. Add `.deep` earlier in the chain to use deep equality
       * instead (WeakSet targets are not supported). See the `deep-eql` project
       * page for info on the deep equality algorithm: https://github.com/chaijs/deep-eql.
       *
       *     // Target array deeply (but not strictly) includes `{a: 1}`
       *     expect([{a: 1}]).to.deep.include({a: 1});
       *     expect([{a: 1}]).to.not.include({a: 1});
       *
       *     // Target object deeply (but not strictly) includes `x: {a: 1}`
       *     expect({x: {a: 1}}).to.deep.include({x: {a: 1}});
       *     expect({x: {a: 1}}).to.not.include({x: {a: 1}});
       *
       * By default, all of the target's properties are searched when working with
       * objects. This includes properties that are inherited and/or non-enumerable.
       * Add `.own` earlier in the chain to exclude the target's inherited
       * properties from the search.
       *
       *     Object.prototype.b = 2;
       *
       *     expect({a: 1}).to.own.include({a: 1});
       *     expect({a: 1}).to.include({b: 2}).but.not.own.include({b: 2});
       *
       * Note that a target object is always only searched for `val`'s own
       * enumerable properties.
       *
       * `.deep` and `.own` can be combined.
       *
       *     expect({a: {b: 2}}).to.deep.own.include({a: {b: 2}});
       *
       * Add `.nested` earlier in the chain to enable dot- and bracket-notation when
       * referencing nested properties.
       *
       *     expect({a: {b: ['x', 'y']}}).to.nested.include({'a.b[1]': 'y'});
       *
       * If `.` or `[]` are part of an actual property name, they can be escaped by
       * adding two backslashes before them.
       *
       *     expect({'.a': {'[b]': 2}}).to.nested.include({'\\.a.\\[b\\]': 2});
       *
       * `.deep` and `.nested` can be combined.
       *
       *     expect({a: {b: [{c: 3}]}}).to.deep.nested.include({'a.b[0]': {c: 3}});
       *
       * `.own` and `.nested` cannot be combined.
       *
       * Add `.not` earlier in the chain to negate `.include`.
       *
       *     expect('foobar').to.not.include('taco');
       *     expect([1, 2, 3]).to.not.include(4);
       *
       * However, it's dangerous to negate `.include` when the target is an object.
       * The problem is that it creates uncertain expectations by asserting that the
       * target object doesn't have all of `val`'s key/value pairs but may or may
       * not have some of them. It's often best to identify the exact output that's
       * expected, and then write an assertion that only accepts that exact output.
       *
       * When the target object isn't even expected to have `val`'s keys, it's
       * often best to assert exactly that.
       *
       *     expect({c: 3}).to.not.have.any.keys('a', 'b'); // Recommended
       *     expect({c: 3}).to.not.include({a: 1, b: 2}); // Not recommended
       *
       * When the target object is expected to have `val`'s keys, it's often best to
       * assert that each of the properties has its expected value, rather than
       * asserting that each property doesn't have one of many unexpected values.
       *
       *     expect({a: 3, b: 4}).to.include({a: 3, b: 4}); // Recommended
       *     expect({a: 3, b: 4}).to.not.include({a: 1, b: 2}); // Not recommended
       *
       * `.include` accepts an optional `msg` argument which is a custom error
       * message to show when the assertion fails. The message can also be given as
       * the second argument to `expect`.
       *
       *     expect([1, 2, 3]).to.include(4, 'nooo why fail??');
       *     expect([1, 2, 3], 'nooo why fail??').to.include(4);
       *
       * `.include` can also be used as a language chain, causing all `.members` and
       * `.keys` assertions that follow in the chain to require the target to be a
       * superset of the expected set, rather than an identical set. Note that
       * `.members` ignores duplicates in the subset when `.include` is added.
       *
       *     // Target object's keys are a superset of ['a', 'b'] but not identical
       *     expect({a: 1, b: 2, c: 3}).to.include.all.keys('a', 'b');
       *     expect({a: 1, b: 2, c: 3}).to.not.have.all.keys('a', 'b');
       *
       *     // Target array is a superset of [1, 2] but not identical
       *     expect([1, 2, 3]).to.include.members([1, 2]);
       *     expect([1, 2, 3]).to.not.have.members([1, 2]);
       *
       *     // Duplicates in the subset are ignored
       *     expect([1, 2, 3]).to.include.members([1, 2, 2, 2]);
       *
       * Note that adding `.any` earlier in the chain causes the `.keys` assertion
       * to ignore `.include`.
       *
       *     // Both assertions are identical
       *     expect({a: 1}).to.include.any.keys('a', 'b');
       *     expect({a: 1}).to.have.any.keys('a', 'b');
       *
       * The aliases `.includes`, `.contain`, and `.contains` can be used
       * interchangeably with `.include`.
       *
       * @name include
       * @alias contain
       * @alias includes
       * @alias contains
       * @param {Mixed} val
       * @param {String} msg _optional_
       * @namespace BDD
       * @api public
       */
    
      function SameValueZero(a, b) {
        return (_.isNaN(a) && _.isNaN(b)) || a === b;
      }
    
      function includeChainingBehavior () {
        flag(this, 'contains', true);
      }
    
      function include (val, msg) {
        if (msg) flag(this, 'message', msg);
    
        var obj = flag(this, 'object')
          , objType = _.type(obj).toLowerCase()
          , flagMsg = flag(this, 'message')
          , negate = flag(this, 'negate')
          , ssfi = flag(this, 'ssfi')
          , isDeep = flag(this, 'deep')
          , descriptor = isDeep ? 'deep ' : '';
    
        flagMsg = flagMsg ? flagMsg + ': ' : '';
    
        var included = false;
    
        switch (objType) {
          case 'string':
            included = obj.indexOf(val) !== -1;
            break;
    
          case 'weakset':
            if (isDeep) {
              throw new AssertionError(
                flagMsg + 'unable to use .deep.include with WeakSet',
                undefined,
                ssfi
              );
            }
    
            included = obj.has(val);
            break;
    
          case 'map':
            var isEql = isDeep ? _.eql : SameValueZero;
            obj.forEach(function (item) {
              included = included || isEql(item, val);
            });
            break;
    
          case 'set':
            if (isDeep) {
              obj.forEach(function (item) {
                included = included || _.eql(item, val);
              });
            } else {
              included = obj.has(val);
            }
            break;
    
          case 'array':
            if (isDeep) {
              included = obj.some(function (item) {
                return _.eql(item, val);
              })
            } else {
              included = obj.indexOf(val) !== -1;
            }
            break;
    
          default:
            // This block is for asserting a subset of properties in an object.
            // `_.expectTypes` isn't used here because `.include` should work with
            // objects with a custom `@@toStringTag`.
            if (val !== Object(val)) {
              throw new AssertionError(
                flagMsg + 'object tested must be an array, a map, an object,'
                  + ' a set, a string, or a weakset, but ' + objType + ' given',
                undefined,
                ssfi
              );
            }
    
            var props = Object.keys(val)
              , firstErr = null
              , numErrs = 0;
    
            props.forEach(function (prop) {
              var propAssertion = new Assertion(obj);
              _.transferFlags(this, propAssertion, true);
              flag(propAssertion, 'lockSsfi', true);
    
              if (!negate || props.length === 1) {
                propAssertion.property(prop, val[prop]);
                return;
              }
    
              try {
                propAssertion.property(prop, val[prop]);
              } catch (err) {
                if (!_.checkError.compatibleConstructor(err, AssertionError)) {
                  throw err;
                }
                if (firstErr === null) firstErr = err;
                numErrs++;
              }
            }, this);
    
            // When validating .not.include with multiple properties, we only want
            // to throw an assertion error if all of the properties are included,
            // in which case we throw the first property assertion error that we
            // encountered.
            if (negate && props.length > 1 && numErrs === props.length) {
              throw firstErr;
            }
            return;
        }
    
        // Assert inclusion in collection or substring in a string.
        this.assert(
          included
          , 'expected #{this} to ' + descriptor + 'include ' + _.inspect(val)
          , 'expected #{this} to not ' + descriptor + 'include ' + _.inspect(val));
      }
    
      Assertion.addChainableMethod('include', include, includeChainingBehavior);
      Assertion.addChainableMethod('contain', include, includeChainingBehavior);
      Assertion.addChainableMethod('contains', include, includeChainingBehavior);
      Assertion.addChainableMethod('includes', include, includeChainingBehavior);
    
      /**
       * ### .ok
       *
       * Asserts that the target is a truthy value (considered `true` in boolean context).
       * However, it's often best to assert that the target is strictly (`===`) or
       * deeply equal to its expected value.
       *
       *     expect(1).to.equal(1); // Recommended
       *     expect(1).to.be.ok; // Not recommended
       *
       *     expect(true).to.be.true; // Recommended
       *     expect(true).to.be.ok; // Not recommended
       *
       * Add `.not` earlier in the chain to negate `.ok`.
       *
       *     expect(0).to.equal(0); // Recommended
       *     expect(0).to.not.be.ok; // Not recommended
       *
       *     expect(false).to.be.false; // Recommended
       *     expect(false).to.not.be.ok; // Not recommended
       *
       *     expect(null).to.be.null; // Recommended
       *     expect(null).to.not.be.ok; // Not recommended
       *
       *     expect(undefined).to.be.undefined; // Recommended
       *     expect(undefined).to.not.be.ok; // Not recommended
       *
       * A custom error message can be given as the second argument to `expect`.
       *
       *     expect(false, 'nooo why fail??').to.be.ok;
       *
       * @name ok
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('ok', function () {
        this.assert(
            flag(this, 'object')
          , 'expected #{this} to be truthy'
          , 'expected #{this} to be falsy');
      });
    
      /**
       * ### .true
       *
       * Asserts that the target is strictly (`===`) equal to `true`.
       *
       *     expect(true).to.be.true;
       *
       * Add `.not` earlier in the chain to negate `.true`. However, it's often best
       * to assert that the target is equal to its expected value, rather than not
       * equal to `true`.
       *
       *     expect(false).to.be.false; // Recommended
       *     expect(false).to.not.be.true; // Not recommended
       *
       *     expect(1).to.equal(1); // Recommended
       *     expect(1).to.not.be.true; // Not recommended
       *
       * A custom error message can be given as the second argument to `expect`.
       *
       *     expect(false, 'nooo why fail??').to.be.true;
       *
       * @name true
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('true', function () {
        this.assert(
            true === flag(this, 'object')
          , 'expected #{this} to be true'
          , 'expected #{this} to be false'
          , flag(this, 'negate') ? false : true
        );
      });
    
      /**
       * ### .false
       *
       * Asserts that the target is strictly (`===`) equal to `false`.
       *
       *     expect(false).to.be.false;
       *
       * Add `.not` earlier in the chain to negate `.false`. However, it's often
       * best to assert that the target is equal to its expected value, rather than
       * not equal to `false`.
       *
       *     expect(true).to.be.true; // Recommended
       *     expect(true).to.not.be.false; // Not recommended
       *
       *     expect(1).to.equal(1); // Recommended
       *     expect(1).to.not.be.false; // Not recommended
       *
       * A custom error message can be given as the second argument to `expect`.
       *
       *     expect(true, 'nooo why fail??').to.be.false;
       *
       * @name false
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('false', function () {
        this.assert(
            false === flag(this, 'object')
          , 'expected #{this} to be false'
          , 'expected #{this} to be true'
          , flag(this, 'negate') ? true : false
        );
      });
    
      /**
       * ### .null
       *
       * Asserts that the target is strictly (`===`) equal to `null`.
       *
       *     expect(null).to.be.null;
       *
       * Add `.not` earlier in the chain to negate `.null`. However, it's often best
       * to assert that the target is equal to its expected value, rather than not
       * equal to `null`.
       *
       *     expect(1).to.equal(1); // Recommended
       *     expect(1).to.not.be.null; // Not recommended
       *
       * A custom error message can be given as the second argument to `expect`.
       *
       *     expect(42, 'nooo why fail??').to.be.null;
       *
       * @name null
       * @namespace BDD
       * @api public
       */
    
      Assertion.addProperty('null', function () {
        this.assert(
            null === flag(this, 'object')
          , 'expected #{this} to be null'
          , 'expected #{this} not to be null'
        );
      });
    
      /**
       * ### .undefined
       *
       * Asserts that the target is strictly (`===`) equal to `undefined`.
       *
       *     expect(undefined).to.be.undefined;
       *
       * Add `.not` earlier in the chain to negate `.undefined`. However, it's often
       * best to assert that the target is equal to its expected value, rather than
       * not equal to `undefined`.
       *
       *     expect(1).to.equal(1); // Recommended
       *     expect(1).to.not.be.undefined; // Not recommended
       *
       * A custom error message can be given as the second argument to `expect`.
       *