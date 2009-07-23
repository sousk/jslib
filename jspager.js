
// Example of Configuration 
// pager: {
//   request_keys: {
//     page:         'page'
//   },
//   response_keys: {
//     // response
//     per_page:     'limit',
//     cur_pnum:     'page',
//     max_pnum:     'max'
//   },
//   selectors: {
//     box:    '#sub-pane .pager',
//     pages:  '#sub-pane .pager > li.page',
//     page_head: '#sub-pane .pager > li.page_head',
//     page_tail: '#sub-pane .pager > li.page_tail',
//     page_next: '#sub-pane .pager > li.page_next',
//     page_back: '#sub-pane .pager > li.page_back'
//   }
// }


jsPager = function(query, config) {
  this.query = query;
  this.config = config;
  this.selectors = config.selectors;
  this.constructors = config.constructors;
  this.request_keys = config.request_keys ? config.request_keys : {
    page:         'page'
  };
  this.response_keys = config.response_keys ? config.response_keys : {
    per_page:     'per_page',
    cur_pnum:     'cur_pnum',
    max_pnum:     'max_pnum'
  };
  this.page_members = ['pages', 'page_head', 'page_tail', 'page_next', 'page_back'];
};

jsPager.prototype = {
  init: function() {
    this.members = {};
    this.params = {};
    this.init_handlers({
      paginate: this.init_click_handler(this.update)
    });
    return this;
  },
  init_handlers: function(handlers) {
    var handlers = $.extend({}, this.config.handler, handlers);
    var that = this;
    if (handlers.paginate) {
      log("set page-column-click event handler");
      var handler = handlers.paginate;
      $.each(that.page_members, function(i, member) {
        that.get(member).find('a').click(handler);
      });
    }
  },
  get: function(name) {
    if (! this.members[name]) {
      this.members[name] = (function(that) {
        // has selector
        if (that.selectors[name]) {
          return $(that.selectors[name]);
        }
        // has constructor
        else if (that.constructors[name]) {
          var con = that.constructors[name];
          if (typeof con == 'function') {
            return con(that);
          }
          else {
            return that[con]();
          }
        }
        else {
          log("ERR: SearchUI has no selector associate with: "+name);
          return null;
        }
      })(this);
    }
    return this.members[name];
  },
  clear: function(name, hard) {
    return hard ? this.get(name).html()
      :this.get(name).text("").hide();
  },
  init_click_handler: function(callback) {
    return function(evt) {
      var anchor = $(this);
      var query = anchor.attr('href');
      log('do ajax pagination:', query);
      $.getJSON(query, callback);
      return false;
    };
  },
  // paginate: function(query, callback) {
  //   $.getJSON(query, callback);
  // },
  update: function(params) {
    // update params
    this.params = this.to_local(params);
    
    // make page params
    var no_pages = this.num_of_pages();
    var cur_pnum = this.params['cur_pnum'];
    var max_pnum = this.params['max_pnum'];
    var start_pnum =  (function() {
      var start = cur_pnum - parseInt(no_pages/2, 10);
      return start > 1 ? start : 1;
    })();
    log(printf("no_pages:%d, cur_pnum:%d, max_pnum:%d, start_pnum:%d", no_pages, cur_pnum, max_pnum, start_pnum));
    
    // build url from last query
    var query = new UrlStrings(this.query);
    var page_key = this.request_keys['page'];
    log("bulid pagination query from:", query);
    
    // declare updator for recursive use
    var update_page_column = function(page, pnum, text) {
      // var page = $(page);
      return $(page).find('a')
        .show().text(text)
        .attr('href', query.set(page_key, pnum).toString());
    };
    
    // update pages
    this.get('pages').each(function(i, page) {
      // each page
      var pnum = start_pnum + i;
      var updated = update_page_column(page, pnum, pnum);
      
      // if (pnum == cur_pnum) {
      //   var a = updated.find('a');
      //   a.before('<span>'+a.html()+'</span>');
      //   a.hide();
      // }
      
      // hide if necessary
      // if (pnum < 0 || pnum > max_pnum) {
      //   log(printf("hide updated:%d (max: %d)", pnum, max_pnum));
      //   updated.hide();
      // }      
    });    
    
    // update misc
    var that = this;
    $.each({
      page_head: 1,
      page_back: cur_pnum > 2 ? cur_pnum - 1: 1,
      page_next: max_pnum > cur_pnum ? cur_pnum + 1 : max_pnum,
      page_tail: max_pnum
    }, function(name, pnum){
      var page = that.get(name);
      update_page_column(page, pnum, page.text());
    });
  },
  to_local: function(params) {
    var conv = {};
    var keymap = this.invert_hash(this.response_keys);
    $.each(params, function(k, v) {
      var local = keymap[k];
      conv[local ? local:k] = v;
    });
    return conv;
  },
  invert_hash: function(hash) {
    var conv = {};
    $.each(hash, function(k, v) {
      conv[v] = k;
    });
    return conv;
  },
  num_of_pages: function() {
    var defined = this.get('pages').length;
    var max = this.params['max_pnum'];
    // if max page num is 0 or 1, then there's only 3 pages
    var pnum =  max < defined ? max : defined;
    return (pnum > 1) ? pnum : (this.num_of_current_items() > 0) ? 1 : 0;
  }
};
