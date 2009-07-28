function run_qspec_test () {
  //----------------------------------------------------------
  module("Specs");
  //----------------------------------------------------------
  var nuko = {
    mew: function() {
      log('mew mew');
    },
    sings: function() {
      return this.mew();
    }
  };
  test("specing", function() {
    countup();
    nuko = spec(nuko);
  
    expect(countup(1));
    nuko.should_receive('mew');
    nuko.sings();
  
    expect(countup(2));
    nuko.should_receive('mew').and_call(function() {
      return 'nyao nyao';
    });
    equals(nuko.sings(), 'nyao nyao');
  
    expect(countup(2));
    nuko.should_receive('mew').and_return('nyao');
    equals(nuko.sings(), 'nyao');
  });
}
