
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


// link on/off strategy
//  <li>&nbsp;<a>1</a></li>
//  on:  <li>&nbsp;<a>1</a><span class="page_unlinked"></span></li>
//  off: <li>&nbsp;<a></a><span class="page_unlinked">1</span></li>
//

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
  
  // element that hold text to strip anchor
  this.unlinked_holder_selector = "span.unlinked_text_holder";
  this.unlinked_holder_template = '<span class="unlinked_text_holder"></span>';
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
  updator: function() {
    var that = this;
    
    return function(params) {
      
    };
  },
  // obsoleted
  update: function(params) {
    // update params
    // this.params = this.to_local(params);
    this.updateParams(params);
    
    // make page params
    var no_pages = this.num_of_pages();
    var cur_pnum = this.params['cur_pnum'];
    var max_pnum = this.params['max_pnum'];
    var start_pnum =  (function() {
      var start = cur_pnum - parseInt(no_pages/2, 10);
      return start > 1 ? start : 1;
    })();
    log(printf("no_pages:%d, cur_pnum:%d, max_pnum:%d, start_pnum:%d", no_pages, cur_pnum, max_pnum, start_pnum));
    
    var col_updator = this.page_column_updator(this.query);
    var stripper = this.page_link_stripper();
    
    // update pages
    this.get('pages').each(function(i, column) {
      // each page
      var pnum = start_pnum + i;
      var column = col_updator(column, pnum, pnum);
      
      // need unlink ?
      if (pnum == cur_pnum) {
        // stripper();
        // var a = updated.find('a');
        // a.before('<span>'+a.html()+'</span>');
        // a.hide();
      }
      
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
      var column = that.get(name);
      col_updator(column, pnum, column.text());
    });
  },
  page_link_stripper: function() {
    var that = this;
    return function(column) {
      var column = $(column);
      var anchor = column.find('a');
      var holder = (function(a) {
        var h = a.find(that.unlinked_holder_selector);
        if (1 > h.length) {
          h = $(that.unlinked_holder_template);
          column.append(h);
        }
        return h;
      })(anchor);
      
      holder.html(anchor.html());
      anchor.empty();
      return column;
    };
  },
  // query: basement query, to edit for pagination
  page_column_updator: function(base_query) {
    var query = new UrlStrings(base_query);
    var pnum_key = this.request_keys['page'];
    
    return function(column, pnum, text) {
      return $(column).find('a')
        .text(text)
        .attr('href', query.set(pnum_key, pnum).toString())
      .end();
    };
  },
  // page: page object
  // pnum: page number
  // text: text to link
  update_page_column: function(page, pnum, text) {
    return $(page).find('a')
      .show().text(text)
      .attr('href', query.set(page_key, pnum).toString())
    .end();
  },
  // set page parameters
  // should update with each request
  updateParams: function(params) {
    log("jsPager: update parameters: ", params);
    // parameter keys can be changed by user
    // so we have to convert internal key name
    var conv = {};
    var keymap = this.invert_hash(this.response_keys);
    $.each(params, function(k, v) {
      var local = keymap[k];
      conv[local ? local:k] = v;
    });
    this.params = conv;
    return this;
  },
  _to_local: function(params) {
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
