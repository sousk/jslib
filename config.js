window.log = getLogger();
if (! window['config']) window.config = {};

$.extend(window.config, {
  pager: {
    request_keys: {
      // local-name: parameter-key
      page:         'page'
    },
    response_keys: {
      // response
      per_page:     'per_page',
      cur_pnum:     'current',
      last_pnum:    'last'
    },
    selectors: {
      box:    '.pager',
      cols:  '.pager > li.col',
      col_first: '.pager > li.col_first',
      col_last: '.pager > li.col_last',
      col_next: '.pager > li.col_next',
      col_back: '.pager > li.col_back'
    }
  }
});
