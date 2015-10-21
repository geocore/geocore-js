describe("Geocore User API", function() {

  before(function(done) {
    geocore
      .setup('http://dev1.geocore.jp/api', 'PRO-TEST-1')
      .login('USE-TEST-1-ADMIN-1', 'nimda')
      .then(function(token) { done(); });
  });

  describe("get", function() {
    it("should returns user object with the specified ID", function() {
      return geocore.users
        .get('USE-TEST-1-ADMIN-1')
        .then(function (user) { return user.id; })
        .should.eventually.equal('USE-TEST-1-ADMIN-1');
    });
  });

  describe("update", function() {
    it("should returns user object with updated name", function() {
      return geocore.users
        .get('USE-TEST-1-ADMIN-1')
        .then(function (user) {
          return geocore.users
            .update(user.id, {name: 'Administrator JS Test'});
        })
        .then(function (user) { return user.name; })
        .should.eventually.equal('Administrator JS Test');
    });
    // return the name to the original name (Administrator)
    it("should returns user object with name back to original", function() {
      return geocore.users
        .get('USE-TEST-1-ADMIN-1')
        .then(function (user) {
          return geocore.users
            .update(user.id, {name: 'Administrator'});
        })
        .then(function (user) { return user.name; })
        .should.eventually.equal('Administrator');
    });
  });

});
