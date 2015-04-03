/**
 * Created by ChenXiao on 2015/3/19.
 */
var fx = {global: {}};
/**
 * Check if the given name has been fx.provided. This will return false for
 * names that are available only as implicit namespaces.
 * @param {string} name name of the object to look for.
 * @return {boolean} Whether the name has been provided.
 * @private
 */
fx.isProvided_ = function(name) {
    return fx.isDefAndNotNull(getObjectByName(name));
};
/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
fx.isDefAndNotNull = function(val) {
    // Note that undefined == null.
    return val != null;
};
/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.  If you are using a compilation pass that
 * renames property names beware that using this function will not find renamed
 * properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |fx.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
var getObjectByName = function(name) {
    var parts = name.split('.');
    var cur = window;
    for (var part; part = parts.shift();) {
        if (fx.isDefAndNotNull(cur[part])) {
            cur = cur[part];
        } else {
            return null;
        }
    }
    return cur;
};


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system. Note that all calls to fx.require will be
 * stripped by the JSCompiler when the --closure_pass option is used.
 * @see fx.provide
 * @param {string} name Namespace to include (as was given in fx.provide()) in
 *     the form "fx.package.part".
 * @param {Object=} opt_obj The object within which to look; default is
 *     |fx.global|.
 * @return {?} If called within a fx.module file, the associated namespace or
 *     module otherwise null.
 */
var require = function(name,cb,opt_obj) {
    // If the object already exists we do not need do do anything.
    if (fx.isProvided_(name)) {
        cb(getObjectByName(name));
    }
    var parts = name.split('.');
    var cur = window;
    for (var part; part = parts.shift();) {
        if (fx.isDefAndNotNull(cur[part])) {
            cur = cur[part];
        } else {
            cur=cur[part]={};
        }
    }
    cb(cur);
    return cur;
};

var load=function(name,opt_obj){
    return getObjectByName(name,opt_obj);
};
