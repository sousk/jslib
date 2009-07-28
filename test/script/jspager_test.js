function jspager_test () {
  
  function __test() {};
  
  var path = "/foo/bar?nuko=cha";
  var pager;
  function init_pager(config, query, raw) {
    // if (!config) config = window.config.pager;
    pager = new jsPager(query || path, config || window.config.pager);
    if (! raw) pager = spec(pager);
    return pager;
  }
  
  //----------------------------------------------------------
  module("LIST: helpers");
  //----------------------------------------------------------
  
  // << < 2 3 [4] 5 6 > >>
  var param = {
    per_page:  5,
    current:   4,
    last:   23
  };
  
  // << < 1 [2] 3 4> >>
  var param_fewpages = {
    per_page:  5,
    current:   2,
    last:    4
  };
  
  // << < 1 > >>
  var param_empty = {
    per_page:  5,
    current:   1,
    last:    1
  };

  // << < 8 9 10 11 [12] > >>
  var param_last = {
    per_page:  8,
    current:   12,
    last:    12
  };
  
  // << < [1] 2 3 4 5 > >>
  var param_first = {
    per_page:  6,
    current:   1,
    last:    12
  };
  


  //----------------------------------------------------------
  module("LIST: pager");
  //----------------------------------------------------------
  test("update pager", function() {
    init_pager();
    ok(pager, 'got pager');
  });


  // Terms
  //
  // << < 1 2 [3] 4 5 > >>
  // page-column: stands for each item display above
  // no_: number of
  // 

  //----------------------------------------------------------
  module("jsPager: handle page parameters");
  //----------------------------------------------------------
  test("invert hash", function() {
    var h = {a: "aa", b: "bb", c:"cc"};
    same({aa: "a", bb: "b", cc:"c"}, pager.invert_hash(h));
  });
  
  test("set-up parameters", function() {
    init_pager(); up();
    var keys = pager.config.response_keys;
    
    // set parameter
    expect(up(1));
    ok(pager.set_params(param));
    
    expect(up(2));
    equals(param.current, pager.page.current);
    equals(param.last, pager.page.last);
  });
  
  test("page columns", function() {
    init_pager(); up();
    
    pager.set_params(param);
    equals(pager.get_num_of_columns(), 5);
    var cols = pager.gen_column_numbers();
    // << < 2 3 [4] 5 6 > >>
    same(cols, [2,3,4,5,6], "page numbers matched");
    
    pager.set_params(param_fewpages);
    equals(pager.get_num_of_columns(), 4);
    var cols = pager.gen_column_numbers();
    // << < 1 [2] 3 4> >>
    same(cols, [1,2,3, 4], "page numbers matched");

    pager.set_params(param_empty);
    equals(pager.get_num_of_columns(), 1);
    var cols = pager.gen_column_numbers();
    // << < [1] > >>
    same(cols, [1], "page numbers matched");
    
    // << < 8 9 10 11 [12] > >>
    pager.set_params(param_last);
    equals(pager.get_num_of_columns(), 5);
    var cols = pager.gen_column_numbers();
    same(cols, [8,9,10,11,12], "page numbers matched");
    
    // << < [1] 2 3 4 5 > >>
    pager.set_params(param_first);
    equals(pager.get_num_of_columns(), 5);
    var cols = pager.gen_column_numbers();
    same(cols, [1,2,3,4,5], "page numbers matched");
  });
  
  
  //----------------------------------------------------------
  module("jsPager: update");
  //----------------------------------------------------------
  
  test("update page-column", function() {
    var updator = pager.get_column_updator('/foo?h=h');
    ok(updator, 'got updator');
  
    var word = 'link me:)';
    var pnum = 8;
    
    // has no link
    var col = updator($('<li>foo<a>1</a>bar</li>'), pnum, word, false);    
    equals(col.find('span').text(), word, 'has unlinked '+word);
    
    // has link
    var col = updator($('<li>foo<a>1</a>bar</li>'), pnum, word, true);
    equals(col.find('a').text(), word, 'has linked '+pnum);
    equals(col.find('span').length, 0, 'has no span');
  });
  
  test("page columns", function() {
    init_pager(); up();
    
    function has_linked_col(pnum) {
      return function(col) {
        equals(col.find('a:visible').text(), pnum, 'has linked '+pnum);
      };
    };
    function has_unlinked_col(pnum) {
      return function(col) {
        same(col.find('a:visible').length, 0);
        equals(col.find(':visible').text(), pnum, 'has unlinked '+pnum);
      };
    };
    function do_test(cols, tests) {
      $.each(tests, function(i, test_fn) {
        test_fn(
          cols.filter(printf(':eq(%d)', i)));
      });
    };
    
    // << < 1 [2] 3 4> >>
    pager.update(param_fewpages);
    do_test(
      pager.get('cols'),
      [ has_linked_col(1), has_unlinked_col(2), has_linked_col(3), has_linked_col(4) ]);
      
    // << < 2 3 [4] 5 6 > >>
    pager.update(param);
    do_test(
      pager.get('cols'),
      [ has_linked_col(2), has_linked_col(3), has_unlinked_col(4), has_linked_col(5, has_linked_col(6)) ]);
    
    // << < [1] > >>
    pager.update(param_empty);
    do_test(
      pager.get('cols'),
      [ has_unlinked_col(1) ]);
    
    // << < 8 9 10 11 [12] > >>
    pager.update(param_last);
    do_test(
      pager.get('cols'),
      [ has_linked_col(8), has_linked_col(9), has_linked_col(10), has_linked_col(11), has_unlinked_col(12) ]);

    // << < [1] 2 3 4 5 > >>
    pager.update(param_first);
    do_test(
      pager.get('cols'),
      [ has_unlinked_col(1), has_linked_col(2), has_linked_col(3), has_linked_col(4), has_linked_col(5) ]);
  });
  
  test('short-cut columns', function() {
    init_pager(); up();
    function has_linked_col(pnum) {
      return function(col) {
        var href = col.find('a:visible').attr('href');
        ok(href, 'has href:'+href);
        if (href) {
          var page_key = pager.config.request_keys.page;
          ok(href.search(
            new RegExp(printf("%s=%d", page_key, pnum))) > 0,
            'has link: '+href);
        }
      };
    };
    function has_unlinked_col(text) {
      return function(col) {
        same(col.find('a:visible').length, 0);
        equals(col.find(':visible').text(), text, 'has unlinked '+text);
      };
    };
    function do_test(first, back, next, last) {
      $.each({
        col_first: first,
        col_back: back,
        col_next: next,
        col_last: last
      }, function(key, test_fn) {
        test_fn(pager.get(key));
      });
    };
    
    // << < 1 [2] 3 4> >>
    pager.update(param_fewpages);
    do_test(
      has_linked_col(1),
      has_linked_col(1),
      has_linked_col(3),
      has_linked_col(param_fewpages.last));

    // << < 2 3 [4] 5 6 > >>
    pager.update(param);
    do_test(
      has_linked_col(1),
      has_linked_col(3),
      has_linked_col(5),
      has_linked_col(param.last));
    
    // << < [1] > >>
    pager.update(param_empty);
    do_test(
      has_unlinked_col('<<'),
      has_unlinked_col('<'),
      has_unlinked_col('>'),
      has_unlinked_col('>>'));

    // << < 8 9 10 11 [12] > >>
    pager.update(param_last);
    do_test(
      has_linked_col(1),
      has_linked_col(11),
      has_unlinked_col('>'),
      has_unlinked_col('>>'));

    // << < [1] 2 3 4 5 > >>
    pager.update(param_first);
    do_test(
      has_unlinked_col('<<'),
      has_unlinked_col('<'),
      has_linked_col(2),
      has_linked_col(param_first.last));
    
  });
};

