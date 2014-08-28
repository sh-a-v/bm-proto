app.stack
  .factory('BookListsResource', ['$resource', function ($resource) {
    return $resource(apiHref + '/a/4/lists.json', {'auth_token': apiToken});
  }])

  .factory('UserBookListReadNowResource', ['$resource', function ($resource) {
    return $resource(apiHref + '/a/4/u/' + apiLogin + '/d/now_reading.json');
  }])

  .factory('UserBookListReadWantResource', ['$resource', function ($resource) {
    return $resource(apiHref + '/a/4/u/' + apiLogin + '/d/read_later.json');
  }])

  .factory('UserBookListAllResource', ['$resource', function ($resource) {
    return $resource(apiHref + '/a/4/u/' + apiLogin + '/d/all.json');
  }]);
