/**
 * URL
 * 
 * @author sou
 *
 * parse / build URL strings
 *
 * <code>
 *  var u = new UrlStrings(a.attr('href'));
 *  for (var k in params) {
 *    u.set(k, params[k]);
 *  }
 *  a.attr('href', u.toString());
 * </code>
 * 
 */

function UrlStrings(url) {
  this.url = url;
  this.base = url.split('?')[0];
  this.query = $.query.load(url); // quejry-object plugin
  // dirty :(
  this.set = function(k, v) {
    this.query = this.query.set(k, v||"");
    return this;
  };
  this.get = function(k) {
    return this.query.get(k);
  };
  this.toString = function() {
    return this.base + this.query.toString();
  };
}
