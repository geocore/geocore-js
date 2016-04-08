describe("Geocore Group/Authority API", function() {

    before(function(done) {
        geocore
            .setup('http://_replace_with_geocore_api_endpoint', '#replace_with_test_project_id')
            .login('#replace_with_test_user_id', '#replace_with_test_user_password')
            .then(function(token) { done(); });
    });

    describe("Add Group", function() {
        it("should returns the newly created group", function() {
            return geocore.groups
                .add(
                    {
                        "id": "GRO-TEST-1-jsapi_test_1",
                        "name": "JS API group create test",
                        "customData": {
                            "key1": "value1",
                            "key2": "value2"
                        }
                    },
                    ['USE-TEST-1-ADMIN-1'])
                .then(function (group) { return group.id; })
                .should.eventually.equal('GRO-TEST-1-jsapi_test_1');
        });
    });

    describe("Simple Group Get", function() {
        it("should returns the specified group", function() {
            return geocore.groups
                .get('GRO-TEST-1-jsapi_test_1')
                .then(function (group) { return group.id; })
                .should.eventually.equal('GRO-TEST-1-jsapi_test_1');
        });
    });

    describe("Query Group Get", function() {
        it("should returns the specified group", function() {
            var query = new geocore.groups.query();
            return query
                .withId('GRO-TEST-1-jsapi_test_1')
                .get()
                .then(function (group) { return group.id; })
                .should.eventually.equal('GRO-TEST-1-jsapi_test_1');
        });
    });

    describe("Add Child Group", function() {
        it("should returns the newly created child group", function() {
            return geocore.groups
                .add(
                    {
                        "id": "GRO-TEST-1-jsapi_test_2",
                        "name": "JS API child group create test",
                        "parent": {
                            "id": "GRO-TEST-1-jsapi_test_1"
                        },
                        "customData": {
                            "key3": "value3",
                            "key4": "value4"
                        }
                    },
                    ['USE-TEST-1-ADMIN-1'])
                .then(function (group) { return group.id; })
                .should.eventually.equal('GRO-TEST-1-jsapi_test_2');
        });
    });

    describe("Add Authority", function() {
        it("should returns the newly created authority", function() {
            return geocore.authorities
                .add(
                    {
                        "id": "AUT-TEST-1-jsapi_test_1",
                        "name": "JS API authority create test",
                        "customData": {
                            "key5": "value5",
                            "key6": "value6"
                        }
                    },
                    ['GRO-TEST-1-jsapi_test_1'])
                .then(function (authority) { return authority.id; })
                .should.eventually.equal('AUT-TEST-1-jsapi_test_1');
        });
    });

    describe("Delete Authority", function() {
        it("should returns the deleted authority", function() {
            return geocore.authorities
                .del('AUT-TEST-1-jsapi_test_1')
                .then(function (authority) { return authority.id; })
                .should.eventually.equal('AUT-TEST-1-jsapi_test_1');
        });
    });

    describe("Delete Group", function() {
        it("should returns the deleted child group", function() {
            return geocore.groups
                .del('GRO-TEST-1-jsapi_test_2')
                .then(function (group) { return group.id; })
                .should.eventually.equal('GRO-TEST-1-jsapi_test_2');
        });
        it("should returns the deleted group", function() {
            return geocore.groups
                .del('GRO-TEST-1-jsapi_test_1')
                .then(function (group) { return group.id; })
                .should.eventually.equal('GRO-TEST-1-jsapi_test_1');
        });
    });

    describe("Confirm Group Deletion", function() {
        it("should be rejected because the group is deleted", function() {
            return geocore.groups
                .get('USE-TEST-1-ADMIN-1')
                .should.be.rejected;
        });
    });

});