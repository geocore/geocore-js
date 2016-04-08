describe("Geocore basic API", function() {
  
  describe("Setup", function() {
    it("should have values as passed in the constructor", function() {
      geocore("base_url_0", "project_id_0");
      expect(geocore.BASE_URL).to.equal("base_url_0");
      expect(geocore.PROJECT_ID).to.equal("project_id_0");
    });
    it("should have values as passed in setup", function() {
      geocore.setup("base_url_1", "project_id_1");
      expect(geocore.BASE_URL).to.equal("base_url_1");
      expect(geocore.PROJECT_ID).to.equal("project_id_1");
    });
  });
  
  describe("Login", function() {
    it("should return valid token", function() {
      return geocore
        .setup('http://_replace_with_geocore_api_endpoint', '#replace_with_test_project_id')
        .login('#replace_with_test_user_id', '#replace_with_test_user_password')
        .should.eventually.equal('#replace_with_test_token');
    });
    it("should cause invalid user/password error", function() {
      return geocore
          .setup('http://_replace_with_geocore_api_endpoint', '#replace_with_test_project_id')
        .login('dummy', 'dummy')
        .should.be.rejected;
    });
  });

});
