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
      distance: 0,
      currentBook: null,
      animatedBook: null,

      initialize: function () {
        this.setEventListeners();
        this.fetchUserBookListReadNow();
      },

      setEventListeners: function () {
        $scope.$on('stack:nextBookShown', this.setDefaultStateAfterNextBookShown.bind(this));
        $scope.$on('stack:previousBookShown', this.setDefaultStateAfterPreviousBookShown.bind(this));
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

      setDefaultStateAfterNextBookShown: function () {
        this.setAnimatedBook(this.currentBook);

        this.bookShowingPartially = false;
        this.bookShowingFully = false;
        this.firstBookShowed = false;
        this.distance = 0;

        if (!this.nextBook) {
          this.lastBookShowed = true;
        }
      },

      setDefaultStateAfterPreviousBookShown: function () {
        this.setCurrentBook(this.animatedBook);

        this.bookShowingPartially = false;
        this.bookShowingFully = false;
        this.lastBookShowed = false;
        this.distance = 0;

        if (!this.previousBook) {
          this.firstBookShowed = true;
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

      getNextBookFully: function ($event) {
        this.bookShowingFully = true;

        if (!this.isBookShowingPartially()) {
          if (!this.nextBook) {
            return;
          }

          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookFully($event);
      },

      getPreviousBookFully: function ($event) {
        this.bookShowingFully = true;

        if (!this.isBookShowingPartially()) {
          if (!this.previousBook) {
            return;
          }

          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowPreviousBookFully($event);
      },

      getBookPartially: function ($event) {
        if (this.isBookShowingFully()) {
          return;
        }

        this.distance = this.distance ? this.distance + $event.clientX : $event.clientX;

        this.distance <= 0 ? this.getNextBookPartially($event) : this.getPreviousBookPartially($event);
      },

      getNextBookPartially: function ($event) {
        if (!this.nextBook && this.isLastBookShowed()) {
          return;
        }

        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookPartially($event);
      },

      getPreviousBookPartially: function ($event) {
        if (!this.previousBook && this.isFirstBookShowed()) {
          return;
        }

        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookPartially($event);
      },

      endGetBookPartially: function ($event) {
        this._broadcastEndShowBookPartially($event);
      },

      isBookShowingFully: function () {
        return this.bookShowingFully;
      },

      isLastBookShowed: function () {
        return this.lastBookShowed;
      },

      isFirstBookShowed: function () {
        return this.firstBookShowed;
      },

      isBookShowingPartially: function () {
        return this.bookShowingPartially;
      },

      _broadcastShowNextBookFully: function ($event) {
        $scope.$broadcast('stack:showNextBookFully', $event);
      },

      _broadcastShowNextBookPartially: function ($event) {
        $scope.$broadcast('stack:showNextBookPartially', $event);
      },

      _broadcastShowNextBook: function ($event) {
        $scope.$broadcast('stack:showNextBook', $event);
      },

      _broadcastShowPreviousBookFully: function ($event) {
        $scope.$broadcast('stack:showPreviousBookFully');
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
          scope.$on('stack:showNextBookFully', this.showNextBookCardFully.bind(this));
          scope.$on('stack:showNextBookPartially', this.showNextBookCardPartially.bind(this));
          scope.$on('stack:endShowNextBookPartially', this.endShowNextBookCardPartially.bind(this));
          scope.$on('stack:showPreviousBookFully', this.showPreviousBookCardFully.bind(this));
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
          this.getAnimatedBookCard().el.style.left = this.getAnimatedBookCard().endLeft;
          this.activateAnimatedBookCard();
        },

        showNextBookCardFully: function (e, $event) {//return;
          this.activateAnimatedBookCard();

          this.bookCardShowingFully = true;

          var animatedBookCard = this.getAnimatedBookCard();

          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.endLeft
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true,
            complete: function () {
              this._broadcastNextBookShown();
              this.setAnimatedBookCardToDefaultState();
              this.bookCardShowingFully = false;
            }.bind(this)
          }).then(function () {
          }.bind(this));

          this.bookCardShowingPartially = false;
        },

        showNextBookCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          this.activateAnimatedBookCard();
          this.bookCardShowingPartially = true;

          var animatedBookCard = this.getAnimatedBookCard();
          var distance = Math.min(animatedBookCard.defaultLeftValue + $event.deltaX, animatedBookCard.defaultLeftValue);

          Velocity(animatedBookCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 0,
            promise: true
          }).then(function () {
          }.bind(this));
        },

        hideNextBookCardFully: function (e, $event) {
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
          });
        },

        endShowNextBookCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          if (this.getCurrentLeftDifferenceValue() < this.getWindowWidth() / 2.5) {
            this.hideNextBookCardFully();
          } else {
            this.showNextBookCardFully();
          }
        },

        showPreviousBookCardFully: function (e, $event) {
          this.setAnimatedBookCardToEndState();

          this.bookCardShowingFully = true;

          var animatedBookCard = this.getAnimatedBookCard();

          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.defaultLeft
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true,
            complete: function () {
              //this._broadcastPreviousBookShown();
              //this.setAnimatedBookCardToDefaultState();
              this.bookCardShowingFully = false;
            }.bind(this)
          }).then(function () {
          }.bind(this));

          this.bookCardShowingPartially = false;
        },

        isShowingFully: function () {
          return this.bookCardShowingFully;
        },

        isShowingPartially: function () {
          return this.bookCardShowingPartially;
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
