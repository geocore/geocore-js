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

    it("query based method should return a list of 5 places", function() {
      var newQuery = new geocore.places.query();
      return newQuery.setNum(5).all().should.eventually.have.length(5);
      
    });

    it("Nearest function should not return an error", function() {
      var newQuery = new geocore.places.query();
      return newQuery
              .setNum(10)
              .setCenter(35.671018, 139.724336)
              .nearest()
              .should.eventually.have.length(10);

    });

    it("WithinRectangle function should not return an error", function() {
      var newQuery = new geocore.places.query();
      return newQuery
              .setNum(10)
              .setRectangle(35.6233362620001, 35.6835510000001,
                            139.7086145, 139.782342333)
              .withinRectangle()
              .should.eventually.have.length(10);

    });


  });
});
