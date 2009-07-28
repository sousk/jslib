/**
 * find form objects, and return hash with fresh values
 *
 * @author sou
 */
function form_to_hash(f) {
    var params = {};
    f.find('input').each(function(i, elm) {
        var elm = $(elm);
        var name = elm.attr('name');
        if (name) {
            params[name] = elm.val();
        }
    });
    f.find('select').each(function(i, sel) {
        var sel = $(sel);
        params[sel.attr('name')] = sel.find('option:selected').val();
    });
    
    return params;
}

/**
 * clear form fields
 *
 * <code>
 * clear_fields(
 *   $('#form'), 
 *   [name1, name2]
 * );
 * </code>
 */
function clear_fields(form, target_names) {
  form.find("input[type!=submit], select, textarea").each(function(i, element) {
    if (!target_names || $.inArray(element.attr('name'), target_names)) {
      $(element).val("");
    }
  });
  return form;
}

/**
 * fill form fields with name-attr:value paris
 *
 * <code>
 * fill_fields(
 *   $('#form'), {
 *      nickname: 'huga',
 *      password: 'hoge',
 *      selectbox: 'val'
 *   });
 * </code>
 * 
 * @author sou
 */
function fill_fields(form, namevalues) {
    var selector = "input[COND],select[COND],textarea[COND]";
    $.each(namevalues, function(name, val) {
        var _s = selector.replace(/\[COND\]/g, '[name='+ name +']');
        var _f = form.find(_s);
        _f.val(
            (_f.attr('type') == 'radio') ? [val] : val
        );
    });
}

