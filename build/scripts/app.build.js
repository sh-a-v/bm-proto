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
  'hmPanDown:pandown',

  'hmSwipe:swipe',
  'hmSwipeLeft:swipeleft',
  'hmSwipeRight:swiperight',
  'hmSwipeUp:swipeup',
  'hmSwipeDown:swipedown'
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
        $scope.$on('stack:nextBookShown', this.setAnimatedBookDefaultState.bind(this));
        $scope.$on('stack:previousBookShown', this.setCurrentBookToAnimatedBook.bind(this));
      },

      setUserBookListReadNow: function (res) {
        this.userBookListReadNow = res;

        this.currentBookList = this.userBookListReadNow;
        this.setCurrentBook();
        this.setAnimatedBook(this.currentBook);
      },

      setCurrentBook: function (book) {
        this.currentBook = book || this.currentBookList[0];
        this._setNextBook();
        this._setPreviousBook();
      },

      setAnimatedBook: function (book) {
        this.animatedBook = book || this.currentBook;
      },

      _setNextBook: function () {
        var nextIndex = this.currentBookList.indexOf(this.currentBook) + 1;
        this.nextBook = nextIndex <= this.currentBookList.length - 1 ? this.currentBookList[nextIndex] : null;
      },

      _setPreviousBook: function () {
        var previousIndex = this.currentBookList.indexOf(this.currentBook) - 1;
        this.previousBook = previousIndex >= 0 ? this.currentBookList[previousIndex] : null;
      },

      setAnimatedBookDefaultState: function () {
        this.setAnimatedBook(this.currentBook);
        this.bookShowingPartially = false;
        this.bookShowingFull = false;
        if (!this.nextBook) {
          this.lastBookShowed = true;
        }
      },

      setCurrentBookToAnimatedBook: function () {
        this.setCurrentBook(this.animatedBook);
      },

      fetchUserBookListReadNow: function () {
        UserBookListReadNowResource
          .query().$promise
          .then(this.setUserBookListReadNow.bind(this));
      },

      getNextBookFull: function ($event) {
        this.bookShowingFull = true;

        if (!this.isBookShowingPartially()) {
          if (!this.nextBook) {
            return;
          }

          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookFull($event);
      },

      getNextBookPartially: function ($event) {
        if (this.isBookShowingFull()) {
          return;
        }

        if (!this.nextBook && this.isLastBookShowed()) {
          //alert(this.nextBook);
          return;
        }

        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookPartially($event);
        //console.log('event partially');
      },

      getNextBook: function ($event) {
        var nextIndex = this.currentBookList.indexOf(this.currentBook) + 1;

        if (nextIndex > this.currentBookList.length - 1) {
          return;
        }

        this.currentBook = this.currentBookList[nextIndex];

        this._broadcastShowNextBook($event);
      },

      getPreviousBook: function () {
        var previousIndex = this.currentBookList.indexOf(this.currentBook) - 1;

        if (previousIndex < 0) {
          return;
        }

        this.animatedBook = this.currentBookList[previousIndex];

        this._broadcastShowPreviousBook();
      },

      endGetBookPartially: function ($event) {
        this._broadcastEndShowBookPartially($event);
      },

      testHammer: function ($event) {
        console.log($event);
      },

      isBookShowingFull: function () {
        return this.bookShowingFull;
      },

      isLastBookShowed: function () {
        return this.lastBookShowed;
      },

      isBookShowingPartially: function () {
        return this.bookShowingPartially;
      },

      _broadcastShowNextBookFull: function ($event) {
        $scope.$broadcast('stack:showNextBookFull', $event);
      },

      _broadcastShowNextBookPartially: function ($event) {
        $scope.$broadcast('stack:showNextBookPartially', $event);
      },

      _broadcastShowNextBook: function ($event) {
        $scope.$broadcast('stack:showNextBook', $event);
      },

      _broadcastShowPreviousBook: function () {
        $scope.$broadcast('stack:showPreviousBook');
      },

      _broadcastEndShowBookPartially: function ($event) {
        $scope.$broadcast('stack:endShowNextBookPartially');
      }
    };

    $scope.stack.initialize();
  }]);

app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {
      scope.stack.view = {
        elWidth: 308,
        defaultDuration: 500,

        initialize: function () {
          this.setEventListeners();
        },

        setEventListeners: function () {
          scope.$on('stack:showNextBookFull', this.showNextBookCardFull.bind(this));
          scope.$on('stack:showNextBookPartially', this.showNextBookCardPartially.bind(this));
          scope.$on('stack:endShowNextBookPartially', this.endShowNextBookCardPartially.bind(this));
          //scope.$on('stack:showPreviousBook', showPreviousBookCard);
        },

        getWindowWidth: function () {
          if (!this.windowWidth) {
            this.windowWidth = $window.innerWidth;
          }

          return this.windowWidth;
        },

        getCurrentLeftValue: function () {
          var animatedBookCard = this.getAnimatedBookCard();

          return this.isShowingPartially() ? parseInt(animatedBookCard.el.style.left) : animatedBookCard.defaultLeftValue;
        },

        getCurrentLeftDifferenceValue: function () {
          var animatedBookCard = this.getAnimatedBookCard();

          return Math.abs(Math.abs(animatedBookCard.defaultLeftValue) - Math.abs(this.getCurrentLeftValue()));
        },

        getCalculatedDuration: function () {
          var animatedBookCard = this.getAnimatedBookCard();
          var fullWidth = Math.abs(Math.abs(animatedBookCard.defaultLeftValue) - Math.abs(animatedBookCard.endLeftValue));
          var diffWidth = this.isLeftDirection() ? fullWidth - this.getCurrentLeftDifferenceValue() : this.getCurrentLeftDifferenceValue();

          return this.defaultDuration * diffWidth / fullWidth;
        },

        getAnimatedBookCard: function () {
          if (!this.animatedBookCard) {
            this.animatedBookCard = {};
            this.animatedBookCard.el = document.getElementById('animated-book-card');
            this.animatedBookCard.defaultLeft = $window.getComputedStyle(this.animatedBookCard.el).left;
            this.animatedBookCard.defaultLeftValue = this.animatedBookCard.defaultLeft.indexOf('%') ? this.getWindowWidth() * parseInt(this.animatedBookCard.defaultLeft) / 100 : parseInt(this.animatedBookCard.defaultLeft);
            this.animatedBookCard.endLeft = -1 * this.getWindowWidth() + 'px';
            this.animatedBookCard.endLeftValue = parseInt(this.animatedBookCard.endLeft);
            this.animatedBookCard.width = this.elWidth;
          }

          return this.animatedBookCard;
        },

        activateAnimatedBookCard: function () {
          if (this.active) {
            return;
          }

          this.active = true;
          this.getAnimatedBookCard().el.style.display = 'inline-block';
        },

        deactivateAnimatedBookCard: function () {
          if (!this.active) {
            return;
          }

          this.active = false;

          this.getAnimatedBookCard().el.style.display = 'none';
        },

        setAnimatedBookCardToDefaultState: function () {
          this.deactivateAnimatedBookCard();
          this.getAnimatedBookCard().el.style.left = '';
        },

        setAnimatedBookCardToEndState: function () {
          this.activateAnimatedBookCard();
          this.getAnimatedBookCard().el.style.left = animatedBookCardEl.endLeft;
        },

        showNextBookCardFull: function (e, $event) {//return;
          this.activateAnimatedBookCard();

          this.bookCardShowingFull = true;
          this.direction = 'left';

          var animatedBookCard = this.getAnimatedBookCard();
          //alert();
          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.endLeft
          }, {
            display: 'inline-block',
            duration: 200, //this.getCalculatedDuration(),
            promise: true,
            complete: function () {
              this._broadcastNextBookShown();
              this.setAnimatedBookCardToDefaultState();
              this.bookCardShowingFull = false;
            }.bind(this)
          }).then(function () {
          }.bind(this));

          this.bookCardShowingPartially = false;
        },

        showNextBookCardPartially: function (e, $event) {
          if (this.isShowingFull()) {
            return;
          }

          this.activateAnimatedBookCard();
          this.bookCardShowingPartially = true;

          var animatedBookCard = this.getAnimatedBookCard();
          var distance = Math.min(animatedBookCard.defaultLeftValue + $event.deltaX, animatedBookCard.defaultLeftValue);

          //Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 0,
            promise: true
          }).then(function () {
          }.bind(this));
        },

        hideNextBookCardFull: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedBookCard = this.getAnimatedBookCard();

          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.defaultLeftValue
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true
          }).then(function () {
            //console.log('end', this.direction);
            //
          }.bind(this));

          this.direction = 'right';
        },

        endShowNextBookCardPartially: function (e, $event) {
          if (this.isShowingFull()) {
            return;
          }


          if (this.getCurrentLeftDifferenceValue() < this.getWindowWidth() / 2.5) {
            this.hideNextBookCardFull();
          } else {
            this.showNextBookCardFull();
          }
        },

        showPreviousBookCardFull: function (e, $event) {
          this.direction = 'right';
        },

        isShowingFull: function () {
          return this.bookCardShowingFull;
        },

        isShowingPartially: function () {
          return this.bookCardShowingPartially;
        },

        isLeftDirection: function () {
          return this.direction === 'left';
        },

        _broadcastNextBookShown: function () {
          scope.$broadcast('stack:nextBookShown');
        }
      };

      scope.stack.view.initialize();
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
