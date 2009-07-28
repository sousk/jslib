var getLogger = function() {
  if (typeof(window) != "undefined" && window.console 
    && window.console.log) {
      // Safari and FireBug 0.4
      // Percent replacement is a workaround for cute Safari crashing bug
      // window.console.log(msg.replace(/%/g, '\uFF05'));
      return window.console.log;
  }
  else if (typeof(opera) != "undefined" && opera.postError) {
	  // Opera
    return opera.postError;
  } 
  else if (typeof(Debug) != "undefined" && Debug.writeln) {
    // IE Web Development Helper (?)
    // http://www.nikhilk.net/Entry.aspx?id=93
    return Debug.writeln;
  } 
  else if (typeof(debug) != "undefined" && debug.trace) {
    // Atlas framework (?)
    // http://www.nikhilk.net/Entry.aspx?id=93
    return debug.trace;
  }
  else {
    return function() {};
  }
};


//
// obsoleted
//
/**
 * @author sou
 *
 * <code>
 * var log = Logger.console;
 * log('logging');
 * log('indented 1 level', 1);
 * log('indented 2 level', 2);
 * </code>
 */
var Logger = {
  console : function(msg) {
    var indent = '';
    if (arguments[1] > 0) {
        for (var i=0; i < arguments[1]; i++) {
            indent += '  ';
        };
    }
    if (typeof msg == 'string') msg = indent + msg;
    
    if (typeof(window) != "undefined" && window.console 
      && window.console.log) {
        // Safari and FireBug 0.4
        // Percent replacement is a workaround for cute Safari crashing bug
        // window.console.log(msg.replace(/%/g, '\uFF05'));
        window.console.log(msg);
    }
    else if (typeof(opera) != "undefined" && opera.postError) {
  	  // Opera
      opera.postError(msg);
    } 
    else if (typeof(Debug) != "undefined" && Debug.writeln) {
      // IE Web Development Helper (?)
      // http://www.nikhilk.net/Entry.aspx?id=93
      Debug.writeln(msg);
    } 
    else if (typeof(debug) != "undefined" && debug.trace) {
      // Atlas framework (?)
      // http://www.nikhilk.net/Entry.aspx?id=93
      debug.trace(msg);
    }
  }
};
