/*!
 * aok 1.5.2+201310310237
 * https://github.com/ryanve/aok
 * MIT License 2013 Ryan Van Etten
 */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'aok', function() {

    var implement
      , globe = (function() { return this; }())
      , plain = {}
      , owns = plain.hasOwnProperty
      , toString = plain.toString
      , win = typeof window != 'undefined' && window
      , doc = typeof document != 'undefined' && document
      , nativeConsole = typeof console != 'undefined' && console
      , hasAlert = win && 'alert' in win
      , uid = 0;
      
    /**
     * @constructor 
     * @param {*=} data
     */
    function Aok(data) {
        // Own 'test' unless instantiated w/o args,
        // or unless `data` is 'object' w/o 'test'.
        // Running proceeds only if 'test' is owned.
        if (data && typeof data == 'object')
            for (var k in data) owns.call(data, k) && (this[k] = data[k]); 
        else arguments.length && (this['test'] = data);
        this['init']();
    }

    /**
     * @param {*=} data
     * @return {Aok}
     */
    function aok(data) {
        return arguments.length ? new Aok(data) : new Aok; 
    }
    
    // Sync the prototypes and alias to local.
    implement = aok.prototype = Aok.prototype;
    
    // Console abstractions
    (function(target, console, hasAlert, win) {
        /**
         * @param {string} name
         * @param {(boolean|number)=} force
         * @param {string=} key
         */
        function assign(name, force, key) {
            var method = console && typeof console[name] == 'function' ? function() {
                console[name].apply(console, arguments);
            } : hasAlert ? function() {
                method['force'] && win.alert(name + ': ' + [].join.call(arguments, ' '));
            } : function() {};
            method['force'] = !!force;
            target[key || name] = method;
        }
        
        assign('info', 1);
        assign('warn', 1);
        assign('error', 1);
        assign('trace');
        assign('log');
        assign('log', 0, 'express');
    }(aok, nativeConsole, hasAlert, win));
    
    // Default messages
    implement['pass'] = 'Pass';
    implement['fail'] = 'Fail';
    
    // Alias the "express" method to the prototype for usage from
    // the default handler. Override as needed for customization.
    implement['express'] = aok['express'];
    
    /**
     * @param {*=} item
     * @return {string}
     */
    implement['explain'] = aok['explain'] = function(item) {
        item = arguments.length ? item : this;
        return item === Object(item) ? toString.call(item) : '' + item;
    };
    
    /**
     * @param {*} o
     * @param {(string|number|Function)=} k
     * @example result(0) // 0
     * @example result([1], 0) // 1
     */
    function result(o, k) {
        if (2 != arguments.length) k = o, o = this;
        else typeof k == 'function' ? k : k = o[k];
        return typeof k == 'function' ? k.call(o) : k;
    }
    aok['result'] = result;
    implement['result'] = function(k) {
        return result.apply(aok, 2 == arguments.length ? arguments : [this, k]);
    };

    /**
     * Get a new function that uses try/catch to test if `fn` can run.
     * @param {Function|string} fn callback or key
     * @return {Function}
     */
    aok['can'] = function(fn) {
        return function() {
            try {
                (typeof fn == 'string' ? this[fn] : fn).apply(this, arguments);
            } catch (e) { return false; }
            return true;
        };
    };

    /**
     * @this {Aok|Object}
     * @return {Aok|Object}
     */
    implement['init'] = function() {
        if (this === globe) throw new Error('@this');
        owns.call(this, 'id') || (this['id'] = ++uid);
        owns.call(this, 'test') && this['run']();
        return this;
    };
    
    /**
     * Run test and trigger its handler.
     * @this {Aok|Object}
     * @return {Aok|Object}
     */
    implement['run'] = function() {
        if (this === globe) throw new Error('@this');
        var use = this['result'], at = 'test';
        use = typeof use == 'function' ? use.call(this, at) : result(this, at);
        this[at] = !!use;
        return this['handler']();
    };
    
    /**
     * @this {Aok|Object}
     * @param {(string|number)=} key
     */
    implement['cull'] = function(key) {
        return this[this[null == key ? 'test' : key] ? 'pass' : 'fail'];
    };

    /**
     * default handler can be overridden
     * @return {Aok}
     */
    implement['handler'] = function() {
        var msg = this['cull']();
        if (typeof msg == 'function') {
            msg.call(this);
        } else {
            msg = this['explain'](msg);
            owns.call(this, 'remark') && (msg += ' (' + this['explain'](this['remark']) + ')');
            this['express']('#' + this['id'] + ': ' + msg); 
        }
        return this;
    };
    
    /**
     * @param {string} n   
     * @return {Node|boolean}
     */
    aok['id'] = function(n) {
        return doc.getElementById(n) || false;
    };

    return aok;
}));