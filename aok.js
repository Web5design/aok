/*!
 * aok          Extensible test suite API
 * @link        github.com/ryanve/aok
 * @license     MIT
 * @copyright   2013 Ryan Van Etten
 * @version     1.1.0-pre
 */

/*jshint expr:true, sub:true, supernew:true, debug:true, node:true, boss:true, devel:true, evil:true, 
  laxcomma:true, eqnull:true, undef:true, unused:true, browser:true, jquery:true, maxerr:100 */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'aok', function() {

    var win = window
      , doc = document
      , uid = 0;
      
    /**
     * @constructor 
     * @param  {*=}  data
     */
    function Aok(data) {
        var k;
        if (typeof data != 'object' || !data) {
            this['test'] = data;
        } else for (k in data) {
            this[k] = data[k]; 
        }
        this['init']();
    }

    /**
     * @param  {*=}  data
     * @return {Aok}
     */
    function aok(data) { 
        return new Aok(data); 
    }
    
    // sync the prototypes
    aok.prototype = Aok.prototype;
    
    // default messages
    aok.prototype['pass'] = 'Pass';
    aok.prototype['fail'] = 'Fail';
    
    // console methods:
    (function(target, console, win) {
        /**
         * @param  {string}            name
         * @param  {(boolean|number)=} force
         * @param  {string=}           key
         */
        function assign(name, force, key) {
            var method = console && typeof console[name] == 'function' ? function() {
                console[name].apply(console, arguments);
            } : function() {
                method['force'] && win['alert'](name + ': ' + [].join.call(arguments, ' '));
            };
            method['force'] = !!force;
            target[key || name] = method;
        }
        
        assign('info',  1);
        assign('warn',  1);
        assign('error', 1);
        assign('trace');
        assign('log');
        assign('log', 0, 'express');
    }(aok, win.console, win));
    
    // Alias the "express" method. `aok.prototype.express` is used in the 
    // default handler. Override it as needed for customization.
    aok.prototype['express'] = aok['express'];
    
    /**
     * @param  {*}  item
     * @return {string}
     */
    function explain(item) {
        return '' + (item === Object(item) ? aok.prototype.toString.call(item) : item);
    }
    aok['explain'] = explain;
    
    /**
     * @param    {*} o  is an Object or mixed value
     * @param    {(string|number)=}  k  
     * @example  result(0)               // 0
     * @example  result([1], 0)          // 1
     */
    function result(o, k) {
        return 2 == arguments.length ? result.call(o, o[k]) : typeof o == 'function' ? o.call(this) : o;
    }
    aok['result'] = result;
    
    /**
     * @return {Aok}
     */
    aok.prototype['init'] = function() {
        if (this === win) { throw new Error('@this'); }
        null == this['id'] && (this['id'] = ++uid);
        return this['run']();
    };
    
    /**
     * @return {Aok}
     */
    aok.prototype['run'] = function() {
        if (this === win) { throw new Error('@this'); }
        this['test'] = !!result(this, 'test'); // run the test 
        return this['handler'](); // trigger the handler
    };
    
    /**
     * @param  {(string|number)=}    key
     */
    aok.prototype['cull'] = function(key) {
        return this[this[null == key ? 'test' : key] ? 'pass' : 'fail'];
    };

    /**
     * default handler can be overridden
     * @return {Aok}
     */
    aok.prototype['handler'] = function() {
        var msg = this['cull']();
        if (typeof msg == 'string') {
            this.hasOwnProperty('remark') && (msg += ' (' + explain(this['remark']) + ')');
            this['express']('#' + this['id'] + ': ' + msg); 
        } else if (typeof msg == 'function') {
            msg.call(this);
        } return this;
    };
    
    /**
     * @param  {string}  n   
     * @return {Node|boolean}
     */
    aok['id'] = function(n) {
        return doc.getElementById(n) || false;
    };
    
    return aok;
}));