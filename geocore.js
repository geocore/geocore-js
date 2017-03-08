/**
 * @fileoverview
 * MapMotion's Geocore JavaScript API.
 *
 * @author Purbo Mohamad <purbo@mapmotion.jp>
 * @copyright MapMotion, K.K. 2014-2016
 */

(function() {
  "use strict";

  /* ======= Package management ===================================================================================== */

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;
  // Save the previous value of the `geocore` variable.
  var previousGeocore = root.geocore;

  // dependencies

  var has_require = typeof require !== 'undefined';
  var Q = root.Q;
  var superagent = root.superagent;

  if (typeof Q === 'undefined') {
    if (has_require) {
      Q = require('q');
    }
  }

  if (typeof superagent === 'undefined') {
    if (has_require) {
      superagent = require('superagent');
    }
  }

  /**
   * Main object representing Geocore service.
   *
   * @namespace geocore
   * @param {string} baseUrl - Geocore service endpoint base URL (assigned by MapMotion).
   * @param {string} projectId - Geocore project ID (assigned by MapMotion).
   * @returns {geocore}
   */
  var geocore = function(baseUrl, projectId) {
    geocore.BASE_URL = baseUrl;
    geocore.PROJECT_ID = projectId;
    return this;
  };

  // Export the geocore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `geocore` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = geocore;
    }
    exports.geocore = geocore;
  } else {
    root.geocore = geocore;
  }

  /* ======= Base functions  ======================================================================================== */

  /**
   * JavaScript API version.
   * @memberof geocore
   */
  geocore.VERSION = '0.4.18';

  /**
   * Current Geocore base URL.
   * @memberof geocore
   */
  geocore.BASE_URL = null;

  /** Geocore project ID */
  geocore.PROJECT_ID = null;
  /** Access token, not null after successful login. */
  geocore.ACCESS_TOKEN = null;

  /**
   * Setting up required parameters to connect to Geocore server.
   *
   * @memberof geocore
   * @param {string} newBaseUrl - Geocore service endpoint base URL (assigned by MapMotion).
   * @param {string} newProjectId - Geocore project ID (assigned by MapMotion).
   * @returns {object} geocore object.
   */
  geocore.setup = function(newBaseUrl, newProjectId) {
    geocore.BASE_URL = newBaseUrl || geocore.BASE_URL;
    geocore.PROJECT_ID = newProjectId || geocore.PROJECT_ID;
    return geocore;
  };

  geocore._request = function(request) {
    var deferred = Q.defer();

    if (geocore.ACCESS_TOKEN) {
      request.set('Geocore-Access-Token', geocore.ACCESS_TOKEN);
    }

    request.end(function(err, res) {
      if (err) {
        deferred.reject("Unexpected result: " + err);
      } else if (res.ok) {
        if (res.body.status) {
          if ("success" === res.body.status) {
            deferred.resolve(res.body.result);
          } else if ("error" === res.body.status) {
            deferred.reject({code: res.body.code, message: res.body.message});
          } else {
            deferred.reject(res.body);
          }
        } else {
          deferred.reject("Unexpected result: " + res.body);
        }
      } else {
        deferred.reject("HTTP status: " + res.status);
      }
    });

    return deferred.promise;
  };

  /**
   * Common API access.
   *
   * @memberof geocore
   * @param {Function} method - superagent function representing an HTTP method.
   * @param {string} path - API endpoint.
   * @param {object} data - JSON data to be sent to server.
   * @returns {object} promise that will be fulfilled when the Geocore server returns result successfully.
   */
  geocore.request = function(method, path, data) {
    var request = method(geocore.BASE_URL + path);
    if (data) {
      request.send(data);
    }
    return geocore._request(request);
  };

  /**
   * Binary data upload.
   *
   * @memberof geocore
   * @param {string} path - API endpoint.
   * @param {string} field - Form field name.
   * @param {File} file - File object to be uploaded.
   * @param {string} filename - File name to be uploaded.
   * @returns {object} promise that will be fulfilled when the Geocore server returns result successfully.
   */
  geocore.upload = function(path, field, file, filename) {
    return geocore._request(
      superagent
        .post(geocore.BASE_URL + path)
        .attach(field, file, filename));
  };

  /**
   * Helper for API access with HTTP GET.
   *
   * @memberof geocore
   * @param {string} path - API endpoint.
   * @returns {object} promise that will be fulfilled when the Geocore server returns result successfully.
   */
  geocore.get = function(path) {
    return geocore.request(superagent.get, path, null);
  };

  /**
   * Helper for API access with HTTP POST.
   *
   * @memberof geocore
   * @param {string} path - API endpoint.
   * @param {object} data - JSON data to be sent to server.
   * @returns {object} promise that will be fulfilled when the Geocore server returns result successfully.
   */
  geocore.post = function(path, data) {
    return geocore.request(superagent.post, path, data);
  };

  /**
   * Helper for API access with HTTP PUT.
   *
   * @memberof geocore
   * @param {string} path - API endpoint.
   * @param {object} data - JSON data to be sent to server.
   * @returns {object} promise that will be fulfilled when the Geocore server returns result successfully.
   */
  geocore.put = function(path, data) {
    return geocore.request(superagent.put, path, data);
  };

  /**
   * Helper for API access with HTTP DELETE.
   *
   * @memberof geocore
   * @param {string} path - API endpoint.
   * @returns {object} promise that will be fulfilled when the Geocore server returns result successfully.
   */
  geocore.del = function(path) {
    return geocore.request(superagent.del, path, null);
  };

  /**
   * Login to Geocore server.
   *
   * @memberof geocore
   * @param {string} id - Valid Geocore user ID.
   * @param {string} password - Valid Geocore user password.
   * @returns {object} promise that will be fulfilled when the Geocore server returns string token.
   */
  geocore.login = function(id, password) {
    var deferred = Q.defer();
    geocore
      .post('/auth', 'id=' + id + '&password=' + password + "&project_id=" + geocore.PROJECT_ID)
      .then(function(result) {
        geocore.ACCESS_TOKEN = result.token;
        deferred.resolve(geocore.ACCESS_TOKEN);
      })
      .catch(function(error) {
        deferred.reject(error);
      });
    return deferred.promise;
  };

  /**
   * Logout from Geocore.
   *
   * @memberof geocore
   */
  geocore.logout = function () {
    geocore.ACCESS_TOKEN = null;
  };

  /**
   * Checks whether a user has been logged in successfully to Geocore.
   *
   * @memberof geocore
   * @returns {boolean} true if a user has been logged in successfully to Geocore.
   */
  geocore.authenticated = function () {
    if (!geocore.ACCESS_TOKEN || geocore.ACCESS_TOKEN == '') return false;
    return geocore.ACCESS_TOKEN;
  };

  /* ======= Utilities  ============================================================================================= */

  /**
   * Collection of utility functions.
   *
   * @namespace geocore.utils
   */
  geocore.utils = {};

  /**
   * Low-level utility for building query string.
   *
   * @memberof geocore.utils
   * @param {object} options
   * @returns {string}
   */
  geocore.utils.buildQueryString = function(options) {
    if (!options) return '';
    var queryStr = '';
    for (var name in options) {
      // ignore functions
      if (typeof options[name] == "function") continue;
      // append
      if (queryStr.length > 0) queryStr += '&';
      if (options[name] instanceof Array) {
        queryStr += name + '=' + encodeURIComponent(options[name].join(','));
      } else {
        queryStr += name + '=' + encodeURIComponent(options[name]);
      }
    }
    return (queryStr.length == 0) ? '' : ('?' + queryStr);
  };

  /**
   * Combining 2 maps (deprecated)
   *
   * @deprecated
   * @param options1
   * @param options2
   * @returns {{}}
   */
  geocore.utils.mergeOptions = function(options1, options2) {
    var ret = {};
    var name;
    if (options1) for (name in options1) { ret[name] = options1[name]; }
    if (options2) for (name in options2) { ret[name] = options2[name]; }
    return ret;
  };

  /**
   * Generic query options (deprecated in favor of builder pattern)
   *
   * @deprecated
   * @param num
   * @param page
   * @param tagSids
   * @param tagIds
   * @param tagNames
   * @returns {geocore.CommonOptions.utils}
   * @constructor
   */
  geocore.utils.CommonOptions = function(num, page, tagSids, tagIds, tagNames) {
    this.num = num || 0;
    this.page = page || 0;
    this.tagSids = tagSids || [];
    this.tagIds = tagIds || [];
    this.tagNames = tagNames || [];

    this.setNum = function(newNum) {
      this.num = newNum;
      return this;
    };

    this.setPage = function(newPage) {
      this.page = newPage;
      return this;
    };

    this.setTagSystemIds = function(newTagSids) {
      this.tagSids = newTagSids;
      return this;
    };

    this.setTagIds = function(newTagIds) {
      this.tagIds = newTagIds;
      return this;
    };

    this.setTagNames = function(newTagNames) {
      this.tagNames = newTagNames;
      return this;
    };

    this.data = function() {
      var ret = {};
      if (this.num > 0) ret.num = this.num;
      if (this.page > 0) ret.page = this.page;
      if (this.tagSids.length > 0) ret.tag_sids = this.tagSids;
      if (this.tagIds.length > 0) ret.tag_ids = this.tagIds;
      if (this.tagNames.length > 0) ret.tag_names = this.tagNames;
      return ret;
    };

    return this;
  };

  /* ======= Objects API ============================================================================================ */

  /**
   * Generic object services.
   *
   * @namespace geocore.objects
   */
  geocore.objects = {};

  /**
   * Get object's detail information.
   *
   * @memberof geocore.objects
   * @param {string} id - Object's ID or system ID.
   * @returns {object} promise that will be fulfilled when the Geocore server returns object.
   */
  geocore.objects.get = function (id) {
    return geocore.get('/objs/' + id);
  };

  /* ======= Objects Request Builder: Operation  */

  /**
   * Object operation builder base class.
   *
   * @class
   */
  geocore.objects.operation = function() {
    this.id = null;
    this.customDataValue = null;
    this.customDataKey = null;
  };

  /**
   * Sets the object ID to be used in the operation.
   *
   * @param id
   * @returns {geocore.operation.objects.operation}
   */
  geocore.objects.operation.prototype.withId = function (id) {
    this.id = id;
    return this;
  };

  geocore.objects.operation.prototype.havingCustomData = function (customDatavalue, customDataKey) {
    this.customDataValue = customDatavalue;
    return this.setCustomDataKey(customDataKey);
  };

  geocore.objects.operation.prototype.withCustomDataKey = function (customDataKey) {
    this.customDataKey = customDataKey;
    return this;
  };

  /* ======= Objects Request Builder: Query  */

  /**
   * Object query builder base class.
   *
   * @class
   */
  geocore.objects.query = function () {
    geocore.objects.operation.call(this);
    this.name = null;
    this.num = -1;
    this._page = -1;
    this.recentlyCreated = false;
    this.recentlyUpdated = false;
    this.fromDate = null;
    this.toDate = null;
    this.fromDateCreated = null;
    this.toDateCreated = null;
    this.parentId = null;
  };

  geocore.objects.query.prototype = Object.create(geocore.objects.operation.prototype);
  geocore.objects.query.prototype.constructor = geocore.objects.query;

  geocore.objects.query.prototype.withName = function(name) {
    this.name = name;
    return this;
  };

  geocore.objects.query.prototype.numberPerPage = function(num) {
    this.num = num;
    return this;
  };

  geocore.objects.query.prototype.page = function(page) {
    this._page = page;
    return this;
  };

  geocore.objects.query.prototype.orderByRecentlyCreated = function () {
    this.recentlyCreated = true;
    return this;
  };

  geocore.objects.query.prototype.orderByRecentlyUpdated = function () {
    this.recentlyUpdated = true;
    return this;
  };

  /**
   * Limits the query result to all objects updated after the specified date.
   *
   * @param {string} utcDateString UTC date formatted as YYYY/MM/DD hh:mm:ss
   * @returns {geocore.query.objects}
   */
  geocore.objects.query.prototype.updatedAfter = function(utcDateString) {
    this.fromDate = utcDateString;
    return this;
  };

  /**
   * Limits the query result to all objects updated before the specified date.
   *
   * @param {string} utcDateString UTC date formatted as YYYY/MM/DD hh:mm:ss
   * @returns {geocore.query.objects}
   */
  geocore.objects.query.prototype.updatedBefore = function(utcDateString) {
    this.toDate = utcDateString;
    return this;
  };

  /**
   * Limits the query result to all objects created after the specified date.
   *
   * @param {string} utcDateString UTC date formatted as YYYY/MM/DD hh:mm:ss
   * @returns {geocore.query.objects}
   */
  geocore.objects.query.prototype.createdAfter = function(utcDateString) {
    this.fromDateCreated = utcDateString;
    return this;
  };

  /**
   * Limits the query result to all objects created before the specified date.
   *
   * @param {string} utcDateString UTC date formatted as YYYY/MM/DD hh:mm:ss
   * @returns {geocore.query.objects}
   */
  geocore.objects.query.prototype.createdBefore = function(utcDateString) {
    this.toDateCreated = utcDateString;
    return this;
  };

  geocore.objects.query.prototype.withParent = function(parentId) {
    this.parentId = parentId;
    return this;
  };

  geocore.objects.query.prototype.get = function(path) {
    var deferred = Q.defer();

    if (!path) path = '/objs'
    if (this.id) return geocore.get(path + '/' + this.id);

    deferred.reject('Expecting id');
    return deferred.promise;
  };

  geocore.objects.query.prototype.all = function (path) {
    return geocore.get(
        (path ? path : '/objs') +
        geocore.utils.buildQueryString(this.buildQueryParameters()));
  };

  geocore.objects.query.prototype.count = function (path) {
    return geocore.get(
        (path ? path : '/objs/count') +
        geocore.utils.buildQueryString(this.buildQueryParameters()));
  };

  geocore.objects.query.prototype.buildQueryParameters = function () {
    var ret = {};
    if (this.num) ret.num = this.num;
    if (this.page) ret.page = this._page;
    if (this.recentlyCreated) ret.recent_created = this.recentlyCreated;
    if (this.recentlyUpdated) ret.recent_updated = this.recentlyUpdated;
    if (this.fromDate) ret.from_date = this.fromDate;
    if (this.toDate) ret.to_date = this.toDate;
    if (this.fromDateCreated) ret.from_date_created = this.fromDateCreated;
    if (this.toDateCreated) ret.to_date_created = this.toDateCreated;
    if (this.parentId) ret.parent = this.parentId;
    return ret;
  };

  /* ======= Taggable API =========================================================================================== */

  geocore.taggable = {};

  /* ======= Taggable Objects Request Builder: Operation  */

  geocore.taggable.operation = function() {
    geocore.objects.operation.call(this);

    this.tagIdsToAdd = null;
    this.tagIdsToDelete = null;
  };

  geocore.taggable.operation.prototype = Object.create(geocore.objects.operation.prototype);
  geocore.taggable.operation.prototype.constructor = geocore.taggable.operation;

  geocore.taggable.operation.prototype.tag = function (tagIds) {
    this.tagIdsToAdd = tagIds;
    return this;
  };

  geocore.taggable.operation.prototype.untag = function (tagIds) {
    this.tagIdsToDelete = tagIds;
    return this;
  };

  /* ======= Taggable Objects Request Builder: Query  */

  geocore.taggable.query = function () {
    geocore.objects.query.call(this);

    this.tagIds = null;
    this.tagNames = null;
    this.excludedTagIds = null;
    this.excludedTagNames = null;
    this.tagDetails = false;
  };

  geocore.taggable.query.prototype = Object.create(geocore.objects.query.prototype);
  geocore.taggable.query.prototype.constructor = geocore.taggable.query;

  geocore.taggable.query.prototype.withTagIds = function (newTagIds) {
    this.tagIds = newTagIds;
    return this;
  };

  geocore.taggable.query.prototype.withTagNames = function (newTagNames) {
    this.tagNames = newTagNames;
    return this;
  };

  geocore.taggable.query.prototype.excludeTagIds = function (newExcludedTagIds) {
    this.excludedTagIds = newExcludedTagIds;
    return this;
  };

  geocore.taggable.query.prototype.excludeTagNames = function (newExcludedTagNames) {
    this.excludedTagNames = newExcludedTagNames;
    return this;
  };

  geocore.taggable.query.prototype.withTagDetails = function() {
    this.tagDetails = true;
    return this;
  };

  geocore.taggable.query.prototype.buildQueryParameters = function () {
    var ret = geocore.objects.query.prototype.buildQueryParameters.call(this);
    if (this.tagIds) ret.tag_ids = this.tagIds;
    if (this.tagNames) ret.tag_names = this.tagNames;
    if (this.excludedTagIds) ret.excl_tag_ids = this.excludedTagIds;
    if (this.excludedTagNames) ret.excl_tag_names = this.excludedTagNames;
    if (this.tagDetails) ret.tag_detail = true;
    return ret;
  };

  /* ======= Objects API: Data  */

  /**
   * Generic object data services.
   *
   * @namespace geocore.objects.data
   */
  geocore.objects.data = {};

  /**
   * List object's data.
   *
   * @memberof geocore.objects.data
   * @param {string} id - Object's ID or system ID.
   * @returns {object} promise that will be fulfilled when the Geocore server returns an array of data.
   */
  geocore.objects.data.list = function(id) {
    return geocore.get('/objs/' + id + '/data');
  };

  /**
   * Get object's specific data.
   *
   * @memberof geocore.objects.data
   * @param {string} id - Object's ID or system ID.
   * @param {string} key - Key specifying the data.
   * @returns {object} promise that will be fulfilled when the Geocore server returns the requested data.
   */
  geocore.objects.data.get = function(id, key) {
    return geocore.get('/objs/' + id + '/data/' + key);
  };

  /**
   * Add or update object's data specified by key.
   *
   * @memberof geocore.objects.data
   * @param {string} id - Object's ID or system ID.
   * @param {string} key - Key specifying the data.
   * @param {Object} data - Data to be submitted to the server.
   * @returns {Object}
   */
  geocore.objects.data.addOrUpdate = function(id, key, data) {
    return geocore.post('/objs/' + id + '/data/' + key, data);
  };

  /* ======= Objects API: Binaries  */

  /**
   * Generic object binary services.
   *
   * @namespace geocore.objects.bins
   */
  geocore.objects.bins = {};

  /**
   * List object's binary data.
   *
   * @memberof geocore.objects.bins
   * @param {string} id - Object's ID or system ID.
   * @returns {object} promise that will be fulfilled when the Geocore server returns an array of binary data keys.
   */
  geocore.objects.bins.list = function(id) {
    return geocore.get('/objs/' + id + '/bins');
  };

  /**
   * Get object's binary data URL and info.
   *
   * @memberof geocore.objects.bins
   * @param {string} id - Object's ID or system ID.
   * @param {string} key - Binary data key.
   * @returns {object} promise that will be fulfilled when the Geocore server returns binary descriptor object.
   */
  geocore.objects.bins.url = function(id, key) {
    return geocore.get('/objs/' + id + '/bins/' + key + '/url');
  };

  /**
   * Upload binary data for an object.
   *
   * @param {string} id - Object's ID or system ID.
   * @param {string} key - Binary data key.
   * @param {File} file - File to be uploaded
   * @param {string} filename - File name to be uploaded.
   * @returns {Object} promise that will be fulfilled when the Geocore server returns binary descriptor object.
   */
  geocore.objects.bins.upload = function(id, key, file, filename) {
    return geocore.upload('/objs/' + id + '/bins/' + key, 'data', file, filename);
  };

  /* ======= Objects API: Relationships  */

  /**
   * Generic relationship services.
   *
   * @namespace geocore.objects.relationships
   */
  geocore.objects.relationships = {};

  /**
   * Generic relationship binary services.
   *
   * @namespace geocore.objects.relationships.bins
   */
  geocore.objects.relationships.bins = {};

  /**
   * List relationship's binary data.
   *
   * @memberof geocore.objects.relationships.bins
   * @param {string} id1 - 1st object's ID or system ID.
   * @param {string} id2 - 2nd object's ID or system ID.
   * @returns {object} promise that will be fulfilled when the Geocore server returns an array of binary descriptors.
   */
  geocore.objects.relationships.bins.list = function(id1, id2) {
    return geocore.get('/objs/relationship/' + id1 + '/' + id2 + '/bins');
  };

  /**
   * Get relationship's binary data URL and info.
   *
   * @memberof geocore.objects.relationships.bins
   * @param {string} id - Object's ID or system ID.
   * @param {string} key - Binary data key.
   * @returns {object} promise that will be fulfilled when the Geocore server returns binary descriptor object.
   */
  geocore.objects.relationships.bins.url = function(id1, id2, key) {
    return geocore.get('/objs/relationship/' + id1 + '/' + id2 + '/bins/' + key + '/url');
  };

  /* ======= Objects API: Custom Data  */

  geocore.objects.customData = {};

  geocore.objects.customData.update = function(id, key, value) {
    return geocore.post('/objs/' + id + '/customData/' + key + '/' + value, null);
  };

  geocore.objects.customData.del = function(id, key) {
    return geocore.del('/objs/' + id + '/customData/' + key);
  };

  /* ======= Tags API ============================================================================================== */

  /**
   * Tag services.
   *
   * @namespace geocore.tags
   */
  geocore.tags = {};

  geocore.tags.query = function () {
    geocore.taggable.query.call(this);
    this._super = geocore.taggable.query.prototype;

    this.idPrefix = null;
  };

  geocore.tags.query.prototype = Object.create(geocore.taggable.query.prototype);
  geocore.tags.query.prototype.constructor = geocore.tags.query;

  geocore.tags.query.prototype.withIdPrefix = function (idPrefix) {
    this.idPrefix = idPrefix;
    return this;
  };

  geocore.tags.query.prototype.get = function () {
    return this._super.get.call(this, '/tags');
  };

  geocore.tags.query.prototype.all = function () {
    return this._super.all.call(this, '/tags');
  };

  geocore.tags.query.prototype.buildQueryParameters = function () {
    var ret = {};
    if (this.idPrefix) ret.id_prefix = this.idPrefix;
    return ret;
  };

  geocore.tags.get = function (id) {
    return geocore.get('/tags/' + id);
  };

  geocore.tags.add = function (newTag) {
    return geocore.post('/tags', newTag);
  };

  geocore.tags.update = function(id, tagUpdate) {
    return geocore.post('/tags/' + id, tagUpdate);
  };

  geocore.tags.del = function(id) {
    return geocore.del('/tags/' + id);
  };

  /* ======= Users API ============================================================================================== */

  /**
   * User services.
   *
   * @namespace geocore.users
   */
  geocore.users = {};

  /**
   * Get user's detail information.
   *
   * @memberof geocore.users
   * @param {string} id - User's ID or system ID.
   * @returns {object} promise that will be fulfilled when the Geocore server returns user object.
   */
  geocore.users.get = function (id) {
    return geocore.get('/users/' + id);
  };

  /**
   * Update user's information.
   *
   * @memberof geocore.users
   * @param {string} id - User's ID or system ID.
   * @param {object} userUpdate - JSON object with user's information to be updated.
   * @returns {object} promise that will be fulfilled when the Geocore server returns updated user object.
   */
  geocore.users.update = function(id, userUpdate) {
    return geocore.post('/users/' + id, userUpdate);
  };

  /**
   * Get user's groups.
   *
   * @param {string} id - User's ID or system ID.
   */
  geocore.users.groups = function(id) {
    return geocore.get('/users/' + id + '/groups');
  };

  /**
   * Add/register new user.
   *
   * @param {object} newUser - JSON object with new user's information.
   * @param groupIds - String or Array of String of group IDs the newly registered user should be assigned to.
   *
   * @returns {object} promise that will be fulfilled when the Geocore server returns newly registered user object.
   */
  geocore.users.add = function(newUser, groupIds, userGroupTypes, userGroupApprovalStatuses) {

    var groupIdsParameters = "";
    if (groupIds) {
      if (Object.prototype.toString.call(groupIds) === '[object Array]') {
        groupIdsParameters = "&group_ids=" + encodeURIComponent(groupIds.join(','));
      } else if (typeof groupIds === 'string') {
        groupIdsParameters = "&group_ids=" + groupIds;
      }
    }

    var userGroupTypesParameters = "";
    if (userGroupTypes) {
      if (Object.prototype.toString.call(userGroupTypes) === '[object Array]') {
        userGroupTypesParameters = "&user_group_types=" + encodeURIComponent(userGroupTypes.join(','));
      } else if (typeof userGroupTypes === 'string') {
        userGroupTypesParameters = "&user_group_types=" + userGroupTypes;
      }
    }

    var userGroupApprovalStatusesParameters = "";
    if (userGroupApprovalStatuses) {
      if (Object.prototype.toString.call(userGroupApprovalStatuses) === '[object Array]') {
        userGroupApprovalStatusesParameters = "&user_group_apv=" + encodeURIComponent(userGroupApprovalStatuses.join(','));
      } else if (typeof userGroupApprovalStatuses === 'string') {
        userGroupApprovalStatusesParameters = "&user_group_apv=" + userGroupApprovalStatuses;
      }
    }

    return geocore.post('/register?project_id=' + geocore.PROJECT_ID
        + groupIdsParameters
        + userGroupTypesParameters
        + userGroupApprovalStatusesParameters,
        newUser);
  };

  /**
   * Delete the user with the specified ID.
   *
   * @param id - User's ID or system ID to be deleted.
   * @returns {Object} promise that will be fulfilled when the Geocore server returns the deleted user object.
   */
  geocore.users.del = function(id) {
    return geocore.del('/users/' + id);
  };

  /* ======= Groups API ============================================================================================= */

  /**
   * Group service.
   *
   * @namespace geocore.groups
   */
  geocore.groups = {};

  /**
   * Get group's detail information.
   *
   * @memberof geocore.groups
   * @param {string} id - Group's ID or system ID.
   * @returns {object} promise that will be fulfilled when the Geocore server returns the group object.
   */
  geocore.groups.get = function(id) {
    return geocore.get('/groups/' + id);
  };

  /**
   * Get group's users
   *
   * @param {string} id - Group's ID or system ID.
   * @returns {Object}
   */
  geocore.groups.users = function(id) {
    return geocore.get('/groups/' + id + '/users');
  };

  /**
   * Delete the group with the specified ID.
   *
   * @param id - Group's ID or system ID to be deleted.
   * @returns {Object} promise that will be fulfilled when the Geocore server returns the deleted group object.
   */
  geocore.groups.del = function(id) {
    return geocore.del('/groups/' + id);
  };

  /**
   * Update group's information.
   *
   * @memberof geocore.groups
   * @param {string} id - Group's ID or system ID.
   * @param {object} groupUpdate - JSON object with group's information to be updated.
   * @returns {object} promise that will be fulfilled when the Geocore server returns updated group object.
   */
  geocore.groups.update = function(id, groupUpdate) {
    return geocore.post('/groups/' + id, groupUpdate);
  };

  /* ======= Group Request Builder: Query  */

  /**
   * Group query object.
   *
   * @namespace geocore.groups
   */
  geocore.groups.query = function () {
    geocore.taggable.query.call(this);
    this._super = geocore.taggable.query.prototype;
  };

  geocore.groups.query.prototype = Object.create(geocore.taggable.query.prototype);
  geocore.groups.query.prototype.constructor = geocore.groups.query;

  /**
   * Get a specific group. ID need to be specified.
   *
   * @memberof geocore.groups.query
   * @returns {object} promise that will be fulfilled when the Geocore server returns specified group.
   */
  geocore.groups.query.prototype.get = function () {
    return this._super.get.call(this, '/groups');
  };

  /**
   * Get groups that matches the specified criteria.
   *
   * @memberof geocore.groups.query
   * @returns {object} promise that will be fulfilled when the Geocore server returns groups as specified by parameters.
   */
  geocore.groups.query.prototype.all = function () {
    return this._super.all.call(this, '/groups');
  };

  /**
   * Get all authorities assigned to the specified group. ID need to be specified.
   *
   * @memberof geocore.groups.query
   * @returns {object} promise that will be fulfilled when the Geocore server returns group-tag relationships.
   */
  geocore.groups.query.prototype.authorities = function () {
    if (this.id) {
      return geocore.get('/groups/' + this.id + '/auths');
    } else {
      var deferred = Q.defer();
      deferred.reject('Expecting id');
      return deferred.promise;
    }
  };

  /**
   * Get all tags associated to the specified group. ID need to be specified.
   *
   * @memberof geocore.groups.query
   * @returns {object} promise that will be fulfilled when the Geocore server returns group-tag relationships.
   */
  geocore.groups.query.prototype.tags = function () {
    if (this.id) {
      return geocore.get('/groups/' + this.id + '/tags');
    } else {
      var deferred = Q.defer();
      deferred.reject('Expecting id');
      return deferred.promise;
    }
  };

  /**
   * Add new group and optionally assign users to the group
   *
   * @param newGroup - New group to be created.
   * @param userIds - Array of user IDs to be assigned to the newly created group.
   * @returns {Object} promise that will be fulfilled when the Geocore server returns newly created group object.
   */

  /**
   *
   * @param newGroup - New group to be created.
   * @param userIds - Array of user IDs to be assigned to the newly created group.
   * @param {boolean} setCreator - Whether to automatically add logged in user as the creator of the group. Default is true.
   * @returns {Object} promise that will be fulfilled when the Geocore server returns newly created group object.
   */
  geocore.groups.add = function (newGroup, userIds, setCreator) {

    var params = "";

    if (setCreator !== undefined) {
      if (!setCreator) {
        params = "set_creator=false";
      }
    }

    if (userIds && userIds.length > 0) {
      if (params.length > 0) {
        params = params + "&";
      }
      params = params + "user_ids=" + encodeURIComponent(userIds.join(','));
    }

    return geocore.post('/groups' + (params.length > 0 ? ("?" + params) : ""), newGroup);
  };

  geocore.groups.tags = {};

  geocore.groups.tags.add = function(id, tagId, customData) {
    return geocore.post('/groups/' + id + '/tags/' + tagId, customData);
  };

  /* ======= Authorities API =========================================================================================*/

  /**
   * Authority service.
   *
   * @namespace geocore.authorities
   */
  geocore.authorities = {};

  /**
   * Get an authority object's detail information.
   *
   * @memberof geocore.authorities
   * @param {string} id - Authority's ID or system ID.
   * @returns {object} promise that will be fulfilled when the Geocore server returns the authority object.
   */
  geocore.authorities.get = function(id) {
    return geocore.get('/auths/' + id);
  };

  geocore.authorities.groups = {};

  /**
   * Get all groups that has the specified authority.
   *
   * @param {string} id - Authority's ID or system ID.
   * @returns {Object}
   */
  geocore.authorities.groups.all  = function(id) {
    return geocore.get('/auths/' + id + '/groups');
  };

  geocore.authorities.add = function (newAuthority, groupIds) {
    return geocore.post(
        '/auths' + ((groupIds && groupIds.length > 0) ? ('?group_ids=' + encodeURIComponent(groupIds.join(','))) : ''),
        newAuthority);
  };

  geocore.authorities.groups.del = function(authorityId, groupId) {
    return geocore.del('/auths/' + authorityId + "/groups/" + groupId);
  }

  /**
   * Delete the authority with the specified ID.
   *
   * @param id - Authority's ID or system ID to be deleted.
   * @returns {Object} promise that will be fulfilled when the Geocore server returns deleted authority object.
   */
  geocore.authorities.del = function(id) {
    return geocore.del('/auths/' + id);
  };

  /* ======= Places API ============================================================================================= */

  geocore.places = {};

  /* ======= Place Request Builder: Query  */
  
  geocore.places.query = function () {
    geocore.taggable.query.call(this);
    this._super = geocore.taggable.query.prototype;

    this.centerLatitude;
    this.centerLongitude;
    this.radius;
    this.minimumLatitude;
    this.minimumLongitude;
    this.maximumLatitude;
    this.maximumLongitude;
    this.checkinable;
  };

  geocore.places.query.prototype = Object.create(geocore.taggable.query.prototype);
  geocore.places.query.prototype.constructor = geocore.places.query;

  geocore.places.query.prototype.setCenter = function (newCenterLatitude, newCenterLongitude) {
    this.centerLatitude = newCenterLatitude;
    this.centerLongitude = newCenterLongitude
    return this;
  }

  geocore.places.query.prototype.setRadius = function (newRadius) {
    this.radius = newRadius;
    return this;
  };

  geocore.places.query.prototype.setRectangle = function (newMinimumLatitude, newMinimumLongitude, newMaximumLatitude, newMaximumLongitude) {
    this.minimumLatitude = newMinimumLatitude;
    this.minimumLongitude = newMinimumLongitude;
    this.maximumLatitude = newMaximumLatitude;
    this.maximumLongitude = newMaximumLongitude;
      return this;
  };  

  geocore.places.query.prototype.onlyCheckinable = function () {
    this.checkinable = true;
  };

  geocore.places.query.prototype.get = function () {
    return this._super.get.call(this, '/places');
  };

  geocore.places.query.prototype.all = function () {
    return this._super.all.call(this, '/places');
  };

  geocore.places.query.prototype.count = function () {
    return this._super.count.call(this, '/places/count');
  };

  geocore.places.query.prototype.nearest = function() {
    var deferred = Q.defer();
    var dict = this._super.buildQueryParameters.call(this);

    if (this.centerLatitude && this.centerLongitude) {
      dict.lat = this.centerLatitude;
      dict.lon = this.centerLongitude;
      if(this.checkinable) dict.checkinable = 'true';
      return geocore.get(
        "/places/search/nearest" + geocore.utils.buildQueryString(dict));
    }
    deferred.reject('Expecting center lat-lon');
    return deferred.promise; 
  }

  geocore.places.query.prototype.smallestBounds = function() {
    var deferred = Q.defer();
    var dict = this._super.buildQueryParameters.call(this);

    if (this.centerLatitude && this.centerLongitude) {
      dict.lat = this.centerLatitude;
      dict.lon = this.centerLongitude;
      if(this.checkinable) dict.checkinable = 'true';
      return geocore.get(
        "/places/search/smallestbounds" + geocore.utils.buildQueryString(dict));
    }
    deferred.reject('Expecting center lat-lon');
    return deferred.promise; 
  }

  geocore.places.query.prototype.withinRectangle = function() {
    var deferred = Q.defer();
    var dict = this._super.buildQueryParameters.call(this);

    if (this.minimumLatitude && this.minimumLongitude 
      && this.maximumLatitude && this.maximumLongitude) {
      dict.min_lat = this.minimumLatitude;
      dict.min_lon = this.minimumLongitude;
      dict.max_lat = this.maximumLatitude;
      dict.max_lon = this.maximumLongitude;
      if(this.checkinable) dict.checkinable = 'true';
      return geocore.get(
        "/places/search/within/rect" + geocore.utils.buildQueryString(dict));
    }
    deferred.reject('Expecting min-max lat-lon');
    return deferred.promise; 
  }

  geocore.places.query.prototype.events = function() {

  }

  geocore.places.query.prototype.eventRelationships = function() {

  }

  //------End of added methods---------

  geocore.places.get = function (id) {
    return geocore.get('/places/' + id);
  };

  geocore.places.list = function (options) {
    return geocore.get(
      '/places' +
      geocore.utils.buildQueryString(
        (options && options.constructor == geocore.utils.CommonOptions) ? options.data() : options));
  };


  /**
   *
   * @deprecated
   * @param latitudeTop
   * @param longitudeLeft
   * @param latitudeBottom
   * @param longitudeRight
   * @param options
   * @returns {Object}
   */
  geocore.places.searchWithinRect = function (latitudeTop, longitudeLeft, latitudeBottom, longitudeRight, options) {
    return geocore.get(
      '/places/search/within/rect' +
      geocore.utils.buildQueryString(
        geocore.utils.mergeOptions(
          {
            max_lat: latitudeTop,
            min_lon: longitudeLeft,
            min_lat: latitudeBottom,
            max_lon: longitudeRight
          },
          (options && options.constructor == geocore.utils.CommonOptions) ? options.data() : options)));
  };

  /**
   *
   * @deprecated
   * @param latitude
   * @param longitude
   * @param radius
   * @param options
   * @returns {Object}
   */
  geocore.places.searchWithinCircle = function (latitude, longitude, radius, options) {
    return geocore.get(
      '/places/search/within/circle' +
      geocore.utils.buildQueryString(
        geocore.utils.mergeOptions(
          {
            lat: latitude,
            lon: longitude,
            radius: radius
          },
          (options && options.constructor == geocore.utils.CommonOptions) ?
            options.data() :
            options)));
  };

  /**
   *
   * @deprecated
   * @param latitude
   * @param longitude
   * @param options
   * @returns {Object}
   */
  geocore.places.searchNearest = function (latitude, longitude, options) {
    return geocore.get(
      '/places/search/nearest' +
      geocore.utils.buildQueryString(
        geocore.utils.mergeOptions(
          {
            lat: latitude,
            lon: longitude
          },
          (options && options.constructor == geocore.utils.CommonOptions) ? options.data() : options)));
  };

  /**
   *
   * @deprecated
   * @param namePrefix
   * @param options
   * @returns {Object}
   */
  geocore.places.searchByName = function (namePrefix, options) {
    return geocore.get(
      '/places/search/name/' + encodeURIComponent(prefix) +
      geocore.utils.buildQueryString(
        (options && options.constructor == geocore.utils.CommonOptions) ? options.data() : options));
  };



  geocore.places.children = function (id) {
    return geocore.get('/places/' + id + '/children');
  };

  geocore.places.add = function (newPlace, tagIds) {
    return geocore.post(
      '/places' + ((tagIds && tagIds.length > 0) ? ('?tag_ids=' + encodeURIComponent(tagIds.join(','))) : ''),
      newPlace);
  };

  geocore.places.update = function (id, placeUpdate) {
    return geocore.post('/places/' + id, placeUpdate);
  };

  geocore.places.del = function (id) {
    return geocore.del('/places/' + id);
  };

  geocore.places.delGeometry = function (id) {
    return geocore.del('/places/' + id + '/geometry');
  };

  geocore.places.tags = {};

  geocore.places.tags.list = function(id) {
    return geocore.get('/places/' + id + '/tags');
  };

  geocore.places.tags.update = function(id, tagNames) {
    return geocore.post('/places/' + id + '/tags?tag_names=' + encodeURIComponent(tagNames.join(',')), null);
  };

  geocore.places.tags.del = function(id, tagNames) {
    return geocore.post('/places/' + id + '/tags?del_tag_names=' + encodeURIComponent(tagNames.join(',')), null);
  };

  geocore.places.items = {};

  geocore.places.items.list = function(id) {
    return geocore.get('/places/' + id + '/items');
  };

  geocore.places.items.add = function(id, item, tagNames) {
    var path = '/places/' + id + '/items' 
    + ((tagNames && tagNames.length > 0) ? ('?tag_names=' + encodeURIComponent(tagNames.join(','))) : '');
    return geocore.post(path, item);
  };

  /* ======= Items API ============================================================================================== */

  geocore.items = {};

  /* ======= Item Request Builder: Query  */

  geocore.items.query = function () {
    geocore.taggable.query.call(this);
  };

  geocore.items.query.prototype = Object.create(geocore.taggable.query.prototype);
  geocore.items.query.prototype.constructor = geocore.items.query;

  geocore.items.query.prototype.get = function () {
    return geocore.taggable.query.prototype.get.call(this, '/items/')
      .then(function(item) {
        var itemQuery = new geocore.items.query(); 
        item.events = function() {
          return itemQuery.setId(item.id).events();
        };
        item.places = function() {
          return itemQuery.setId(item.id).places();
        };
        return item;
      });
  };

  // TODO: combine promise handler of get(above) & all
  geocore.items.query.prototype.all = function () {
    return geocore.taggable.query.prototype.all.call(this, '/items')
      .then(function(items) {
        var itemQuery = new geocore.items.query();
        items.map(function(item){
          item.events = function() {
            return itemQuery.setId(item.id).events();
          };
          item.places = function() {
            return itemQuery.setId(item.id).places();
          };
        });
        return items;
      });
  };
  
  geocore.items.query.prototype.places = function () {
    if (this.id) {
      return geocore.get('/items/' + this.id + '/places');
    } else {
      var deferred = Q.defer();
      deferred.reject('Expecting id');
      return deferred.promise;
    }
  }

  geocore.items.query.prototype.events = function () {
    if (this.id) {
      return geocore.get('/items/' + this.id + '/events');
    } else {
      var deferred = Q.defer();
      deferred.reject('Expecting id');
      return deferred.promise;
    }
  }

  //------------End of new methods----------------------------------------------
  
  geocore.items.get = function (id) {
    return geocore.get('/items/' + id);
  };

  geocore.items.list = function (options) {
    return geocore.get(
      '/items' +
      geocore.utils.buildQueryString(
        (options && options.constructor == geocore.utils.CommonOptions) ? options.data() : options));
  };

  geocore.items.add = function (newItem, tagNames) {
    return geocore.post(
      '/items' + ((tagNames && tagNames.length > 0) ? ('?tag_names=' + encodeURIComponent(tagNames.join(','))) : ''),
      newItem);
  };

  geocore.items.update = function (id, itemUpdate) {
    return geocore.post('/items/' + id, itemUpdate);
  };

  geocore.items.del = function (id) {
    return geocore.del('/items/' + id);
  };

  geocore.items.tags = {};

  geocore.items.tags.list = function(id) {
    return geocore.get('/items/' + id + '/tags');
  };

  geocore.items.tags.update = function(id, tagNames) {
    return geocore.post('/items/' + id + '/tags?tag_names=' + encodeURIComponent(tagNames.join(',')), null);
  };

  geocore.items.tags.del = function(id, tagNames) {
    return geocore.post('/items/' + id + '/tags?del_tag_names=' + encodeURIComponent(tagNames.join(',')), null);
  };

  geocore.items.tags.replace = function(id, oldTag, newTag) {
    return geocore.post('/items/' + id + 
      '/tags?tag_names=' + encodeURIComponent(newTag) + 
      '&del_tag_names=' + encodeURIComponent(oldTag), null);
  };

  geocore.items.places = {};

  geocore.items.places.list = function(id) {
    return geocore.get('/items/' + id + '/places');
  };

  geocore.items.places.update = function(itemId, placeId) {
    return geocore.post('/items/' + itemId + '/places/' + placeId, null);
  };

  geocore.items.places.del = function(itemId, placeId) {
    return geocore.del('/items/' + itemId + '/places/'+ placeId);
  };

  geocore.items.events = {};

  geocore.items.events.update = function(itemId, eventId) {
    return geocore.post('/items/' + itemId + '/events/' + eventId, null);
  };

  /* ======= Events API ============================================================================================== */

  geocore.events = {};

  /* ======= Event Request Builder: Query  */

  geocore.events.query = function () {
    geocore.taggable.query.call(this);
  };

  geocore.events.query.prototype = Object.create(geocore.taggable.query.prototype);
  geocore.events.query.prototype.constructor = geocore.events.query;

  geocore.events.query.prototype.get = function () {
    return geocore.taggable.query.prototype.get.call(this, '/events/');
  };

  geocore.events.query.prototype.all = function () {
    return geocore.taggable.query.prototype.all.call(this, '/events');
  };


  /* ======= References API ========================================================================================= */

  geocore.ref = {};
  geocore.ref.gadm = {};

  geocore.ref.gadm.level0 = function() {
    return geocore.get('/public/ref/gadm');
  };

  geocore.ref.gadm.level1 = function (level0Id) {
    return geocore.get('/public/ref/gadm/' + level0Id);
  };

  geocore.ref.gadm.level2 = function (level0Id, level1Id) {
    return geocore.get('/public/ref/gadm/' + level0Id + '/' + level1Id);
  };

  geocore.ref.gadm.level3 = function (level0Id, level1Id, level2Id) {
    return geocore.get('/public/ref/gadm/' + level0Id + '/' + level1Id + '/' + level2Id);
  };

  /* ======= Epilogue =============================================================================================== */

  // Run geocore.js in *noConflict* mode, returning the `geocore` variable to its
  // previous owner. Returns a reference to the geocore object.
  geocore.noConflict = function() {
    root.geocore = previousGeocore;
    return this;
  };

}).call(this);
