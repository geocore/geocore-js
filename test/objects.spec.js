describe("Geocore Object API", function() {

    before(function(done) {
        geocore
            .setup('http://_replace_with_geocore_api_endpoint', '#replace_with_test_project_id')
            .login('#replace_with_test_user_id', '#replace_with_test_user_password')
            .then(function(token) { done(); });
    });

    describe("Get", function() {
        it("should returns the specified object", function() {
            var query = new geocore.objects.query();
            return query
                    .withId('USE-TEST-1-ADMIN-1')
                    .get()
                    .then(function (obj) { return obj.id; })
                    .should.eventually.equal('USE-TEST-1-ADMIN-1');
        });
    });

});