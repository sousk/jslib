jsPager = function(query, config) {
  this.query = query;
  this.config = config;
  this.selectors = config.selectors;
  this.constructors = config.constructors || {};
  this.request_keys = config.request_keys ? config.request_keys : {
    page:         'page'
  };
  this.response_keys = config.response_keys ? config.response_keys : {
    per_page:     'per_page',
    cur_pnum:     'cur_pnum',
    last_pnum:     'last_pnum'
  };
  // this.col_members = ['cols', 'col_head', 'col_tail', 'col_next', 'col_back'];
  this.members = {};
  this.init();
};

jsPager.prototype = {
  init: function() {
    this.params = {};
    this.pnum = {};
    // this.init_handlers({
    //   paginate: this.init_click_handler(this.update)
    // });
    return this;
  },
  // init_handlers: function(handlers) {
  //   var handlers = $.extend({}, this.config.handler, handlers);
  //   var that = this;
  //   if (handlers.paginate) {
  //     log("set page-column-click event handler");
  //     var handler = handlers.paginate;
  //     $.each(that.page_members, function(i, member) {
  //       that.get(member).find('a').click(handler);
  //     });
  //   }
  // },
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
  binded: function(fname) {
    // var fn = this[fname];
    var that = this;
    return typeof(that[fname]) == 'function' ?
      function() {
        return that[fname].apply(that, arguments);
      }:
      function() {
        log("there's no method named:"+fname);
        return false;
      };
  },
  assign_handlers: function(extend) {
    log('SearchBookmarker: assign_handlers called');
    var that = this;
    var handler_setting = $.extend({}, this.handlers, extend);
    $.each(handler_setting, function(name, handlers) {
      $.each(handlers, function(event, handler) {
        that.get(name).bind(event, handler);
      });
    });
  },
  // clear: function(name, hard) {
  //   return hard ? this.get(name).html()
  //     :this.get(name).text("").hide();
  // },
  // init_click_handler: function(callback) {
  //   return function(evt) {
  //     var anchor = $(this);
  //     var query = anchor.attr('href');
  //     log('do ajax pagination:', query);
  //     $.getJSON(query, callback);
  //     return false;
  //   };
  // },
  // paginate: function(query, callback) {
  //   $.getJSON(query, callback);
  // },
  // set parameters
  set_params: function(params) {
    this.params = this.to_local(params);
    this.page = {
      last: this.params['last_pnum'],
      current: this.params['cur_pnum']
    };
    
    this.column_numbers = this.gen_column_indexes();
    return this;
  },
  // << < 2 3 [4] 5 6 > >> gets [2,3,4,5,6]
  // << < 1 [2] 3 4> >> gets [1,2,3,4]
  // << < 8 9 10 11 [12] > >> gets [8,9,10,11,12]
  // << < [1] 2 3 4 5 > >> gets [1,2,3,4,5]
  gen_column_indexes: function() {
    var current = this.page.current;
    var last = this.page.last;
    var num_of_cols = this.get_num_of_columns();
    
    // term:
    //       1  2 3 [4] 5      
    //   [from] 2 3  4 [to] 
    var steps = parseInt(num_of_cols/2, 10);
    if (num_of_cols > current + steps) {
      var from  = 1; //current;
      var to = from + (num_of_cols - 1);
    }
    else if(current + steps > last) {
      var to = last;
    }
    else {
      var to = (function() {
        var n = current + steps;
        return last > n ? n : last;
      })();
    }

    var from = (function() {
      var n = to - (num_of_cols - 1);
      return n > 1 ? n : 1;
    })();
    
    var cols = [];
    for (var i=from; i <= to; i++) {
      if (i > 0) cols.push(i);
    };
    // log("gets ",'f:'+from, 't:'+to, 's:'+steps, 'c:'+current, 'l:'+last, num_of_cols, cols);
    return cols;
  },
  update: function(param) {
    return this.set_params(param)
      .update_page_columns()
      .update_shortcut_columns();
  },  
  update_page_columns: function() {
    var that = this;
    var updator = this.get_column_updator(this.query);
    log("jsPager: bulid pagination query from:", this.query);
    
    // update page cols
    this.get('cols').each(function(i, page) {
      var pnum = that.column_numbers[i];
      // col, pnum, text, has_link
      updator($(page), pnum, pnum, pnum != that.page.current);      
    });
    
    return that;
  },
  update_shortcut_columns: function() {
    var that = this;
    var updator = this.get_column_updator(this.query);
    var cur = that.page.current;
    
    var link_backward = that.page.current > 1;
    var link_forward  = that.page.last > that.page.current;
    $.each({
      'col_first': [link_backward, 1], 
      'col_back': [link_backward, cur > 2 ? cur - 1 : 1], 
      'col_next': [link_forward, cur + 1],
      'col_last': [link_forward, that.page.last]
    }, function(key, param) {
      var column  = that.get(key);
      var pnum = param[1];
      // log("update-shc: ", key, param, column.find('a').text());
      // col, pnum, text, has_link
      var updated = updator(column, pnum, column.find('a').text(), param[0]);
    });
    return that;
  },
  get_column_updator: function(query) {
    var that = this;
    var query = new UrlStrings(query);
    var pnum_key = this.config.request_keys['page'];
    return function(column, pnum, text, has_link) {
      var link = query.set(pnum_key, pnum).toString();
      
      // update
      column.find('a')
        .show().text(text || "")
        .attr('href', link);
      
      // adjust link
      var a = column.find('a');
      var span = column.find('span.pager-temp');
      if (has_link) {
        // show
        a.show();
        span.remove();
      }
      else {
        // hide link
        a.hide();
        if (! span.length > 0) {
          a.before('<span class="pager-temp"></span>');
          span = column.find('span.pager-temp');
        }
        span.html(a.html());;
      }
      
      // adjust column
      if (! pnum) { // has no page number, maybe beyond the last
        column.hide();
      }
      else {
        column.show();
      }
      return column;
    };
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
  // << < 2 3 [4] 5 6 > >> gets 5
  // << < 10 11 [12] > >> gets 3
  get_num_of_columns: function() {
    var defined = this.get('cols').length;
    
    // if page has 5 cols, and last-page is 0 or 1, then there's only 1 cols
    var last = this.params['last_pnum'];
    var limit =  defined > last ? last : defined;
    return (limit > 1) ? limit : 1;
  }
};
