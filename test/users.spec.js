describe("Geocore User API", function() {

  before(function(done) {
    geocore
        .setup('http://_replace_with_geocore_api_endpoint', '#replace_with_test_project_id')
        .login('#replace_with_test_user_id', '#replace_with_test_user_password')
        .then(function(token) { done(); });
  });

  describe("Get user", function() {
    it("should returns user object with the specified ID", function() {
      return geocore.users
        .get('USE-TEST-1-ADMIN-1')
        .then(function (user) { return user.id; })
        .should.eventually.equal('USE-TEST-1-ADMIN-1');
    });
  });

  describe("Get user's groups", function() {
    it("should returns user object with the specified ID", function() {
      return geocore.users
          .groups('USE-TEST-1-ADMIN-1')
          .should.eventually.have.length(2);
    });
  });

  describe("Update user", function() {
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
