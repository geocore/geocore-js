describe("Geocore User API", function() {

  before(function(done) {
    geocore
      .setup('http://dev1.geocore.jp/api', 'PRO-TEST-1')
      .login('USE-TEST-1-ADMIN-1', 'nimda')
      .then(function(token) { done(); });
  });

  describe("list", function() {
    it("should returns a list of 5 places", function() {
      return geocore.places
        .list(new geocore.utils.CommonOptions().setNum(5))
        .should.eventually.have.length(5);
    });
  });




});
