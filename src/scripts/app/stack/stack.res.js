app.stack
  .factory('BookListsResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/lists.json', {
      'auth_token': CONFIG.api.token
    });
  }])

  .factory('UserBookListReadNowResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/d/now_reading.json');
  }])

  .factory('UserBookListReadWantResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/d/read_later.json');
  }])

  .factory('UserBookListAllResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/d/all.json');
  }])

  .factory('UserMarkersResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/m/grouped.json');
  }])

  .factory('CatalogBestResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/lists/fJb1wiBI.json', null, {
      'query': { method: 'GET', isArray: false }
    })
  }])

  .factory('CatalogNewResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/lists/UXt1r5P3.json', null, {
      'query': { method: 'GET', isArray: false }
    })
  }])

  .factory('CatalogPopularResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/d/popular.json', null, {
      'query': { method: 'GET', isArray: false }
    })
  }])

  .factory('CatalogFriendsResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/a/subscribed.json', {
      'auth_token': CONFIG.api.token
    })
  }]);
