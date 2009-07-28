/**
 * Name Attribute Text
 * 
 * @author sou
 *
 * parse/build PHP style name attribute text
 * 
 *  var attr = new NameAttrText('ranks[2][8][rank_title]');
 *  attr.numbers[0];  *  returns 2
 *  attr.set(0, 9); attr.numbers[0];  *  returns 9
 *  attr.set(0, 9); attr.text();  *  ranks[9][8][rank_title]
 */
function NameAttrText(source_string) {
  this.source = source_string;
  this.numbers = function() {
    var nums = source_string.match(/\d+/g);
    for (var i=0; i < nums.length; i++) {
      nums[i] = parseInt(nums[i], 10);
    };
    return nums;
  }();
  this.set = function(index, value) {
    this.numbers[index] = value;
    return this;
  };
  this.increment = function(index) {
    this.numbers[index] = this.numbers[index] + 1;
    return this;
  };
  this.text = function() {
    var num_c = 0;
    var text = '';
    var parts = this.source.split(/\d+/g);
    
    for (var i=0; i < parts.length; i++) {
      var p = parts[i];
      text += p;
      if (p.substr(-1, 1) == '[') {
        // push num
        text += this.numbers[num_c++];
      }
    };
    return text;
  };
};
