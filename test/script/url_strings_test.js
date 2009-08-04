function url_strings_test() {
  var gquery = "http://www.google.com/search?client=safari&rls=en-us&q=nuko&ie=UTF-8&oe=UTF-8";
  function init(q) {
    return new UrlStrings(q || gquery);
  };
  
  //----------------------------------------------------------
  module("Functions");
  //----------------------------------------------------------
  
  test("to hash", function() {
    
    var u = init('/foo?a=&b=2');
    same(u.to_hash(), {
      a: "",
      b: 2
    });
    
    var u = init('/foo/bar?q&limit=5');
    same(u.to_hash(), {
      q: "",
      limit: 5
    });
  });
}
