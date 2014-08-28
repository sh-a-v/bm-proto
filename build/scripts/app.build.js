'use strict';

var app = angular.module('app', ['ui.router', 'ngResource', 'ngTouch', 'hmTouchEvents', 'app.stack']);

app.config(function($stateProvider, $locationProvider, $resourceProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home'
    })
    .state('home.now', {
      url: '/now',
      title: 'Read now'
    })
    .state('home.want', {
      url: '/want',
      title: 'Want to read'
    })
    .state('home.all', {
      url: '/all',
      title: 'All books'
    })
    .state('home.quotes', {
      url: '/quotes',
      title: 'Quotes'
    })

    .state('catalog', {
      url: '/catalog'
    })
    .state('catalog.all', {
      url: '/all',
      title: 'Catalog'
    })
    .state('catalog.friends', {
      url: '/friends',
      title: 'Friends'
    })
    .state('catalog.popular', {
      url: '/popular',
      title: 'Popular'
    })
    .state('catalog.shelves', {
      url: '/shelves',
      title: 'Shelves'
    });

  $urlRouterProvider
    .otherwise("/home/now");

  $locationProvider
    .html5Mode(true);

  $resourceProvider
    .defaults.stripTrailingSlashes = true;
});

var apiHref = 'https://bookmate.com';
var apiToken = 'P1Rc2q7Ka1tVE4gojBh1rr3zeDNo3rbF';
var apiLogin = 'shershnevav';

app.controller('AppCtrl', ['$rootScope', '$scope', '$state', 'BookListsResource', function ($rootScope, $scope, $state, BookListsResource) {
  $scope.app = {
    $state: $state,
    savedState: {
      home: 'home.now',
      catalog: 'catalog.all'
    },

    initialize: function () {
      this.setBookLists();
      //this.fetchBookLists();
    },

    getCurrentTitle: function () {
      return this.$state.current.title;
    },

    getCurrentStateName: function () {
      return this.$state.current.name;
    },

    getCurrentSplitStateName: function () {
      return this.getCurrentStateName().replace('.', ' ');
    },

    getCurrentParentStateName: function () {
      return this.$state.$current.parent.name;
    },

    goToState: function (state) {
      this.savedState[this.getCurrentParentStateName()] = state;
      this.$state.go(state);
    },

    toggleParentState: function () {
      if (this.getCurrentParentStateName() === 'home') {
        this.$state.go(this.savedState.catalog);
      } else {
        this.$state.go(this.savedState.home);
      }
    },

    setBookLists: function () {
      this.bookLists = [];
    },

    fetchBookLists: function () {
      BookListsResource.query(function (res) {
        console.log('booklists:', res);
      });
    }
    /*,

    getBookLists: function () {
      return this.bookLists;
    },

    fetchBookLists: function () {
      BookListsResource.get()
    }*/
  };

  $scope.app.initialize();

  console.log('state:', $scope.app.$state);
}]);

app.stack = angular.module('app.stack', []);

var hmTouchEvents = angular.module('hmTouchEvents', []);

var hmGestures = [
  'hmPan:pan',
  'hmPanStart:panstart',
  'hmPanMove:panmove',
  'hmPanEnd:panend',
  'hmPanCancel:pancancel',
  'hmPanLeft:panleft',
  'hmPanRight:panright',
  'hmPanUp:panup',
  'hmPanDown:pandown'
];

angular.forEach(hmGestures, function (name) {

  var
    directive = name.split(':'),
    directiveName = directive[0],
    eventName = directive[1];

  hmTouchEvents.directive(directiveName, ['$parse', function ($parse) {
    return {
      scope: true,
      link: function(scope, element, attr) {
        var fn, opts;

        fn = $parse(attr[directiveName]);
        opts = $parse(attr['hmOptions'])(scope, {});

        if(opts && opts.group) {
          scope.hammer = scope.hammer || Hammer(element[0], opts);
        } else {
          scope.hammer = Hammer(element[0], opts);
        }

        return scope.hammer.on(eventName, function(event) {
          return scope.$apply(function() {
            return fn(scope, {
              $event: event
            });
          });
        });

      }
    };
  }
  ]);
});

app.stack
  .controller('StackCtrl', ['$rootScope', '$scope', '$state', 'UserBookListReadNowResource', function ($rootScope, $scope, $state, UserBookListReadNowResource) {
    $scope.stack = {
      currentBook: null,
      animatedBook: null,

      initialize: function () {
        this.setEventListeners();
        this.fetchUserBookListReadNow();
      },

      setEventListeners: function () {
        $scope.$on('stack:nextBookShown', this.setAnimatedBookToCurrentBook.bind(this));
        $scope.$on('stack:previousBookShown', this.setCurrentBookToAnimatedBook.bind(this));
      },

      setUserBookListReadNow: function (res) {
        console.log(res);
        this.userBookListReadNow = res;

        this.currentBookList = this.userBookListReadNow;
        this.currentBook = this.userBookListReadNow[0];
        this.setAnimatedBookToCurrentBook();
      },

      setAnimatedBookToCurrentBook: function () {
        this.animatedBook = this.currentBook;
      },

      setCurrentBookToAnimatedBook: function () {
        console.log(this.currentBook);
        this.currentBook = this.animatedBook;
        console.log(this.currentBook);
      },

      fetchUserBookListReadNow: function () {
        UserBookListReadNowResource
          .query().$promise
          .then(this.setUserBookListReadNow.bind(this));
      },

      getNextBook: function () {
        var nextIndex = this.currentBookList.indexOf(this.currentBook) + 1;

        if (nextIndex > this.currentBookList.length - 1) {
          return;
        }

        this.currentBook = this.currentBookList[nextIndex];

        this._broadcastShowNextBook();
      },

      getPreviousBook: function () {
        var previousIndex = this.currentBookList.indexOf(this.currentBook) - 1;

        if (previousIndex < 0) {
          return;
        }

        this.animatedBook = this.currentBookList[previousIndex];

        this._broadcastShowPreviousBook();
      },

      _broadcastShowNextBook: function () {
        $scope.$broadcast('stack:showNextBook');
      },

      _broadcastShowPreviousBook: function () {
        $scope.$broadcast('stack:showPreviousBook');
      }
    };

    $scope.stack.initialize();
  }]);

app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {
      var windowWidth = $window.innerWidth;
      var animatedBookCardEl = document.getElementById('animated-book-card');
      var animatedBookCardElDefaultLeft = $window.getComputedStyle(animatedBookCardEl).left;
      var animatedBookCardElLeft = -1 * windowWidth + 'px';
      var animatedBookCardElDuration = 300;

      var showNextBookCard = function () {
        animatedBookCardEl.style.display = '';
        animatedBookCardEl.style.left = animatedBookCardElDefaultLeft;

        if (scope.reverseTimeout) {
          clearTimeout(scope.reverseTimeout);
        }

        Velocity(animatedBookCardEl, {
          left: animatedBookCardElLeft
        }, {
          display: 'inline-block',
          duration: animatedBookCardElDuration,
          promise: true
        });

        scope.reverseTimeout = setTimeout(function () {
          scope.$broadcast('stack:nextBookShown');
        }, animatedBookCardElDuration);
      };

      var showPreviousBookCard = function () {
        animatedBookCardEl.style.left = animatedBookCardElLeft;
        animatedBookCardEl.style.left = 'inline-block';

        if (scope.reverseTimeout) {
          clearTimeout(scope.reverseTimeout);
        }

        Velocity(animatedBookCardEl, {
          left: animatedBookCardElDefaultLeft
        }, {
          //display: 'none',
          duration: animatedBookCardElDuration,
          promise: true
        });

        scope.reverseTimeout = setTimeout(function () {
          scope.$broadcast('stack:previousBookShown');
        }, animatedBookCardElDuration);
      };

      scope.$on('stack:showNextBook', showNextBookCard);
      scope.$on('stack:showPreviousBook', showPreviousBookCard);
    }
  }
}]);

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
