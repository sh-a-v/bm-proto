app.stack
  .factory('BookListsResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/lists.json', {'auth_token': CONFIG.api.token});
  }])

  .factory('UserBookListReadNowResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/d/now_reading.json');
  }])

  .factory('UserBookListReadWantResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/d/read_later.json');
  }])

  .factory('UserBookListAllResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/d/all.json');
  }]);
