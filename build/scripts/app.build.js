'use strict';

var app = angular.module('app', ['ui.router', 'ngResource', 'ngTouch', 'hmTouchEvents', 'app.stack', 'app.popup']);

app.config(function($stateProvider, $locationProvider, $resourceProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      abstract: true,
      url: '/home',
      templateUrl: 'empty.html'
    })
    .state('home.now', {
      url: '/now',
      title: 'Read now',
      resource: 'UserBookListReadNowResource',
      templateUrl: 'stack/stack-home-book.html',
      type: 'book'
    })
    .state('home.want', {
      url: '/want',
      title: 'Want to read',
      resource: 'UserBookListReadWantResource',
      templateUrl: 'stack/stack-home-book.html',
      type: 'book'
    })
    .state('home.all', {
      url: '/all',
      title: 'All books',
      resource: 'UserBookListAllResource',
      templateUrl: 'stack/stack-home-book.html',
      type: 'book'
    })
    .state('home.quotes', {
      url: '/quotes',
      title: 'Quotes',
      resource: 'UserMarkersResource',
      templateUrl: 'stack/stack-home-quote.html',
      type: 'quote'
    })

    .state('catalog', {
      abstract: true,
      url: '/catalog',
      templateUrl: 'empty.html'
    })
    .state('catalog.all', {
      url: '/all',
      title: 'Catalog',
      resource: 'CatalogNewResource',
      templateUrl: 'stack/stack-catalog-book.html',
      type: 'book'
    })
    .state('catalog.friends', {
      url: '/friends',
      title: 'Friends',
      resource: 'CatalogFriendsResource',
      templateUrl: 'stack/stack-catalog-friend.html',
      type: ''
    })
    .state('catalog.popular', {
      url: '/popular',
      title: 'Popular',
      resource: 'CatalogPopularResource',
      templateUrl: 'stack/stack-catalog-book.html',
      type: 'book'
    })
    .state('catalog.shelves', {
      url: '/shelves',
      title: 'Shelves',
      resource: 'CatalogShelvesResource',
      templateUrl: 'stack/stack-catalog-shelf.html',
      type: 'shelf'
    });

  $urlRouterProvider
    .otherwise("/home/now");

  $locationProvider
    .html5Mode(true);

  $resourceProvider
    .defaults.stripTrailingSlashes = true;
});

app.controller('AppCtrl', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
  $scope.app = {
    $state: $state,
    savedState: {
      home: 'home.now',
      catalog: 'catalog.all'
    },

    initialize: function () {

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
    }
  };

  $scope.app.initialize();

  console.log('state:', $scope.app.$state);
}]);

app.popup = angular.module('app.popup', ['app.popup.messages', 'app.popup.notifications', 'app.popup.search']);

app.stack = angular.module('app.stack', []);

app.popup.messages = angular.module('app.popup.messages', []);

app.popup.notifications = angular.module('app.popup.notifications', []);

app.popup.search = angular.module('app.popup.search', []);

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

app.popup.controller('PopupCtrl', ['$scope', function ($scope) {
  $scope.popup = {
    active: false,

    initialize: function () {
      this.setEventListeners();
    },

    setEventListeners: function () {
      $scope.$on('messages:activated', this.activate.bind(this));
      $scope.$on('notifications:activated', this.activate.bind(this));
      $scope.$on('search:activated', this.activate.bind(this));
    },

    activate: function () {
      if (this.isActive()) {
        return;
      }

      this.active = true;
      this._broadcastPopupActivated();
    },

    deactivate: function () {
      this.active = false;
      this._broadcastPopupDeactivated();
    },

    toggle: function () {
      this.isActive() ? this.deactivate() : this.activate();
    },

    isActive: function () {
      return this.active;
    },

    _broadcastPopupActivated: function () {
      $scope.$broadcast('popup:activated');
    },

    _broadcastPopupDeactivated: function () {
      $scope.$broadcast('popup:deactivated');
    }
  };

  $scope.popup.initialize();
}]);

app.popup.directive('popup', ['$window', function ($window) {
  return {
    restrict: 'E',
    controller: 'PopupCtrl',
    templateUrl: 'popup.html',
    link: function (scope, el, attrs) {
      scope.popup.view = {
        wrapperEl: document.getElementById('popup-wrapper'),
        popupEl: el,
        scaleVisibleState: true,

        initialize: function () {
          this.setEventListeners();
        },

        setEventListeners: function () {
          scope.$on('popup:activated', this.showPopup.bind(this));
          scope.$on('popup:deactivated', this.hidePopup.bind(this));
        },

        getWindowWidth: function () {
          if (!this.windowWidth) {
            this.windowWidth = $window.innerWidth;
          }

          return this.windowWidth;
        },

        getWindowHeight: function () {
          if (!this.windowHeight) {
            this.windowHeight = $window.innerHeight;
          }

          return this.windowHeight;
        },

        showPopup: function () {
          if (this.scaleVisibleState) {
            this.scalePopupToHiddenState(1);
          }

          Velocity(this.wrapperEl, {
            opacity: 1
          }, {
            display: 'inline-block',
            duration: 1,
            complete: function () {
              this.scalePopupToVisibleState();
            }.bind(this)
          });
        },

        hidePopup: function () {
          Velocity(this.wrapperEl, {
            opacity: 0
          }, {
            display: 'none',
            duration: 100,
            begin: function () {
              this.scalePopupToHiddenState();
            }.bind(this)
          });
        },

        scalePopupToHiddenState: function (duration) {
          Velocity(this.popupEl, {
            height: '10%'
          }, {
            duration: duration || 200
          });

          this.scaleVisibleState = false;
        },

        scalePopupToVisibleState: function (duration) {
          Velocity(this.popupEl, {
            height: '100%'
          }, {
            duration: duration || 200
          });

          this.scaleVisibleState = true;
        }
      };

      scope.popup.view.initialize();
    }
  };
}]);

app.stack.controller('StackCtrl', [
  '$rootScope', '$scope', '$state', '$timeout', 'UserBookListReadNowResource', 'UserBookListReadWantResource', 'UserBookListAllResource', 'UserMarkersResource', 'CatalogNewResource', 'CatalogBestResource', 'CatalogPopularResource', 'CatalogFriendsResource', 'CatalogShelvesResource',
  function ($rootScope, $scope, $state, $timeout, UserBookListReadNowResource, UserBookListReadWantResource, UserBookListAllResource, UserMarkersResource, CatalogNewResource, CatalogBestResource, CatalogPopularResource, CatalogFriendsResource, CatalogShelvesResource) {
    $scope.stack = {
      expandedView: false,
      expandingView: false,

      distance: 0,
      currentItem: null,
      animatedItem: null,
      firstItemShowed: true,

      resources: {
        'UserBookListReadNowResource': UserBookListReadNowResource,
        'UserBookListReadWantResource': UserBookListReadWantResource,
        'UserBookListAllResource': UserBookListAllResource,
        'UserMarkersResource': UserMarkersResource,
        'CatalogBestResource': CatalogBestResource,
        'CatalogNewResource': CatalogNewResource,
        'CatalogPopularResource': CatalogPopularResource,
        'CatalogFriendsResource': CatalogFriendsResource,
        'CatalogShelvesResource': CatalogShelvesResource
      },

      initialize: function () {
        this.setEventListeners();
        this.fetchUserItemList();
      },

      setEventListeners: function () {
        $scope.$on('stack:nextItemShown', this.setDefaultStateAfterNextItemShown.bind(this));
        $scope.$on('stack:previousItemShown', this.setDefaultStateAfterPreviousItemShown.bind(this));

        $scope.$on('stack:nextItemHidden', this.setDefaultStateAfterNextItemHidden.bind(this));
        $scope.$on('stack:previousItemHidden', this.setDefaultStateAfterPreviousItemHidden.bind(this));

        $scope.$on('stack:stackedView', this.setStackedView.bind(this));
        $scope.$on('stack:expandedView', this.setExpandedView.bind(this));
        $scope.$on('stack:expandingViewPartially', this.setExpandingView.bind(this));
      },

      setUserItemList: function (res) {
        this.currentItemList = this._handleRes(res);

        this.setCurrentItem();
        this.setAnimatedItem(this.currentItem);
      },

      setCurrentItem: function (item) {
        this.currentItem = item || this.currentItemList[0];
        this._setNextItem();
        this._setPreviousItem();
      },

      setAnimatedItem: function (item) {
        this.animatedItem = item || this.currentItem;
      },

      _setNextItem: function () {
        var nextIndex = this.currentItemList.indexOf(this.currentItem) + 1;
        this.nextItem = nextIndex <= this.currentItemList.length - 1 ? this.currentItemList[nextIndex] : null;
      },

      _setPreviousItem: function () {
        var previousIndex = this.currentItemList.indexOf(this.currentItem) - 1;
        this.previousItem = previousIndex >= 0 ? this.currentItemList[previousIndex] : null;
      },

      setDefaultStateAfterNextItemShown: function () {
        this.setAnimatedItem(this.currentItem);
        this.cleanDistance();

        this._setDefaultValues();
      },

      setDefaultStateAfterNextItemHidden: function () {
        this.setCurrentItem(this.animatedItem);
        this.cleanDistance();

        this._setDefaultValues();
      },

      setDefaultStateAfterPreviousItemShown: function () {
        this.setCurrentItem(this.animatedItem);
        this.setAnimatedItem(this.currentItem);
        this.cleanDistance();

        this._setDefaultValues();

        $scope.$apply();
      },

      setDefaultStateAfterPreviousItemHidden: function () {
        this.setAnimatedItem(this.currentItem);
        this.cleanDistance();

        this._setDefaultValues();
      },

      _setDefaultValues: function () {
        this.itemShowingPartially = false;
        this.itemShowingFully = false;
        this.firstItemShowed = false;
        this.lastItemShowed = !this.nextItem;
        this.firstItemShowed = !this.previousItem;
      },

      setStackElement: function (id) {
        this.setCurrentItem(this.getItemById(id));
        this.setAnimatedItem(this.getItemById(id));

        this._broadcastStackedViewFromExpanded();
      },

      setExpandingView: function () {
        this.expandingView = true;
      },

      setExpandedView: function () {
        this.expandedView = !this.expandedView;
        this.expandingView = false;

        $scope.$apply();
      },

      setStackedView: function (id) {
        this.expandedView = false;

        $scope.$apply();
      },

      _handleRes: function (res) {
        if (angular.isObject(res) && res.objects) {
          res = res.objects;
        }

        if ($state.$current.resource === 'UserMarkersResource') {
          res = [];
        }

        if ($state.$current.resource === 'CatalogFriendsResource') {
          res = this.friendsList;
        }
        if ($state.$current.resource === 'UserMarkersResource') {
          res = this.quotesList;
        }
        if ($state.$current.resource === 'CatalogShelvesResource') {
          res = this.shelvesList;
        }

        if (res.length === 0 || res.length === 1) {
          this.lastItemShowed = true;
        }

        return res;
      },

      fetchUserItemList: function () {
        this.currentResource = this.resources[$state.$current.resource];

        if (!this.currentResource) {
          return;
        }

        this.currentResource
          .query().$promise
          .then(this.setUserItemList.bind(this));
      },

      getItemById: function (id) {
        return _.find(this.currentItemList, {uuid: id});
      },

      getNextItemFully: function ($event) {
        if (!this.isItemShowingPartially()) {
          if (!this.nextItem) {
            return;
          }

          this.setCurrentItem(this.nextItem);
        }

        this.itemShowingFully = true;

        this._broadcastShowNextItemFully($event);
      },

      getPreviousItemFully: function ($event) {
        if (!this.isItemShowingPartially()) {
          if (!this.previousItem) {
            return;
          }

          this.setAnimatedItem(this.previousItem);
        }

        this.itemShowingFully = true;

        this._broadcastShowPreviousItemFully($event);
      },

      getItemPartially: function ($event) {
        if (this.isItemShowingFully()) {
          this.cleanDistance();
          return;
        }

        if (this.isExpandingView()) {
          return;
        }

        this.previousDistance = this.distance || 0;
        this.distance = $event.deltaX;

        if (this.previousDistance < 0 && this.distance >= 0) {
          this.distance = -1;
        }

        if (this.distance < 0) {
          this.getNextItemPartially($event);
        } else if (this.distance > 0) {
          this.getPreviousItemPartially($event);
        }
      },

      getNextItemPartially: function ($event) {
        if (!this.nextItem && this.isLastItemShowed()) {
          this.cleanDistance();
          return;
        }

        if (!this.isItemShowingPartially()) {
          this.itemShowingPartially = true;
          this.setCurrentItem(this.nextItem);
        }

        this._broadcastShowNextItemPartially($event);
      },

      getPreviousItemPartially: function ($event) {
        if (!this.previousItem && this.isFirstItemShowed()) {
          this.cleanDistance();
          return;
        }

        if (!this.isItemShowingPartially()) {
          this.itemShowingPartially = true;
          this.setAnimatedItem(this.previousItem);
        }

        this._broadcastShowPreviousItemPartially($event);
      },

      endGetItemPartially: function ($event) {
        if (!this.isItemShowingPartially()) {
          return;
        }

        this._broadcastEndShowItemPartially($event, this.distance);
      },

      cleanDistance: function () {
        this.distance = 0;
      },

      isItemShowingFully: function () {
        return this.itemShowingFully;
      },

      isLastItemShowed: function () {
        return this.lastItemShowed;
      },

      isFirstItemShowed: function () {
        return this.firstItemShowed;
      },

      isItemShowingPartially: function () {
        return this.itemShowingPartially;
      },

      isExpandedView: function () {
        return this.expandedView;
      },

      isExpandingView: function () {
        return this.expandingView;
      },

      _broadcastShowNextItemFully: function ($event) {
        $scope.$broadcast('stack:showNextItemFully', $event);
      },

      _broadcastShowNextItemPartially: function ($event) {
        $scope.$broadcast('stack:showNextItemPartially', $event);
      },

      _broadcastShowPreviousItemFully: function ($event) {
        $scope.$broadcast('stack:showPreviousItemFully', $event);
      },

      _broadcastShowPreviousItemPartially: function ($event) {
        $scope.$broadcast('stack:showPreviousItemPartially', $event);
      },

      _broadcastEndShowItemPartially: function ($event, distance) {
        $scope.$broadcast('stack:endShowItemPartially', $event, distance);
      },

      _broadcastStackedViewFromExpanded: function () {
        $scope.$broadcast('stack:stackedViewFromExpanded');
      },

      _broadcastToggleView: function () {
        $scope.$broadcast('stack:toggleView');
      },

      friendsList: [{
        user: {
          photo: '/src/images/photo1.png',
          name: 'Alex Gusev'
        },
        time: 'yesterday',
        type: 'quote',
        doing: 'highlights',
        text: "I'm scared of the geese. When I was five, my mom took me down there to feed those horrible beasts and one of them nearly took my hand off",
        book: {
          title: 'The Summer I Became a Nerd',
          authors: 'Leah Rae Miller',
          cover: '/src/images/small-cover.png'
        }
      }, {
        user: {
          photo: '/src/images/photo1.png',
          name: 'Alex Gusev'
        },
        time: 'yesterday',
        type: 'book',
        doing: 'wants to read',
        book: {
          title: 'Translation Nation',
          authors: 'Hector Tobar',
          cover: '/src/images/big-cover.png'
        }
      }],

      quotesList: [{
        text: "I'm scared of the geese. When I was five, my mom took me down there to feed those horrible beasts and one of them nearly took my hand off",
        book: {
          title: 'The Summer I Became a Nerd',
          authors: 'Leah Rae Miller',
          cover: '/src/images/small-cover.png'
        }
      }],

      shelvesList: [{
        user: {
          photo: '/src/images/photo2.png',
          name: 'NYtimes'
        },
        bg: '/src/images/shelf1.png',
        time: 'yesterday',
        title: 'Travel in Foreign Lands',
        description: 'A collection of books about planes, trains, automobiles and getting lost in a foreign lan',
        count: '156'
      }]
    };

    $scope.stack.initialize();
  }]);

app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {

      /* Stack general */

      scope.stack.view = {
        elWidth: 308,
        defaultDuration: 150,

        initialize: function () {
          this.setEventListeners();
          this.setElementEventListeners();
        },

        setEventListeners: function () {
          scope.$on('stack:showNextItemFully', this.showNextItemCardFully.bind(this));
          scope.$on('stack:showNextItemPartially', this.showNextItemCardPartially.bind(this));

          scope.$on('stack:showPreviousItemFully', this.showPreviousItemCardFully.bind(this));
          scope.$on('stack:showPreviousItemPartially', this.showPreviousItemCardPartially.bind(this));

          scope.$on('stack:endShowItemPartially', this.endShowItemCardPartially.bind(this));

          scope.$on('stack:stackedViewFromExpanded', this.stackedView.bind(this));
        },

        setElementEventListeners: function () {
          angular.element(el).bind('touchstart', this.resetStartPoint.bind(this));
          angular.element(el).bind('touchmove', this.expandView.bind(this));
          angular.element(el).bind('touchend', this.endExpandingPartially.bind(this));
        },

        getWindowWidth: function () {
          if (!this.windowWidth) {
            this.windowWidth = $window.innerWidth;
          }

          return this.windowWidth;
        },

        getWindowHeight: function () {
          if (!this.windowHeight) {
            this.windowHeight = $window.innerHeight;
          }

          return this.windowHeight;
        },

        getCurrentLeftValue: function () {
          var animatedItemCard = this.getAnimatedItemCard();

          return this.isShowingPartially() ? parseInt(animatedItemCard.el.style.left) : animatedItemCard.defaultLeftValue;
        },

        getCurrentLeftDifferenceValue: function () {
          var animatedItemCard = this.getAnimatedItemCard();

          return Math.abs(Math.abs(animatedItemCard.defaultLeftValue) - Math.abs(this.getCurrentLeftValue()));
        },

        getAnimatedItemCard: function () {
          if (!this.animatedItemCard) {
            this.animatedItemCard = {};
            this.animatedItemCard.el = document.getElementById('animated-item-card');
            this.animatedItemCard.defaultLeft = $window.getComputedStyle(this.animatedItemCard.el).left;
            this.animatedItemCard.defaultLeftValue = this.animatedItemCard.defaultLeft.indexOf('%') ? this.getWindowWidth() * parseInt(this.animatedItemCard.defaultLeft) / 100 : parseInt(this.animatedItemCard.defaultLeft);
            this.animatedItemCard.endLeft = -1 * this.getWindowWidth() + this.animatedItemCard.defaultLeftValue + 'px';
            this.animatedItemCard.endLeftValue = parseInt(this.animatedItemCard.endLeft);
            this.animatedItemCard.width = this.elWidth;
          }

          return this.animatedItemCard;
        },

        getStackElement: function () {
          if (!this.stackElement) {
            this.stackElement = document.getElementById('stack-block');
          }

          return this.stackElement;
        },

        getFakeItemCardListElement: function () {
          if (!this.fakeItemCardListElement) {
            this.fakeItemCardListElement = document.getElementById('fake-item-card-list-block');
          }

          return this.fakeItemCardListElement;
        },

        getItemCardListElement: function () {
          if (!this.itemCardListElement) {
            this.itemCardListElement = document.getElementById('item-card-list-block');
          }

          return this.itemCardListElement;
        },

        activateAnimatedItemCard: function () {
          if (this.active) {
            return;
          }

          this.active = true;
          this.getAnimatedItemCard().el.style.display = 'inline-block';
        },

        deactivateAnimatedItemCard: function () {
          if (!this.active) {
            return;
          }

          this.active = false;
          this.getAnimatedItemCard().el.style.display = 'none';
        },

        setAnimatedItemCardToDefaultState: function () {
          this.deactivateAnimatedItemCard();
          this.getAnimatedItemCard().el.style.left = '';
        },

        setAnimatedItemCardToEndState: function () {
          this.getAnimatedItemCard().el.style.left = this.getAnimatedItemCard().endLeft;
          this.activateAnimatedItemCard();
        }
      };


      /* Stack cards */

      scope.stack.view = angular.extend({
        showNextItemCardFully: function (e, $event) {
          this.activateAnimatedItemCard();

          this.itemCardShowingFully = true;

          var animatedItemCard = this.getAnimatedItemCard();

          Velocity(animatedItemCard.el, {
            left: animatedItemCard.endLeft
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this._broadcastNextItemShown();
              this.setAnimatedItemCardToDefaultState();
              this.itemCardShowingFully = false;
            }.bind(this)
          });

          this.itemCardShowingPartially = false;
        },

        showNextItemCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          this.activateAnimatedItemCard();
          this.itemCardShowingPartially = true;

          var animatedItemCard = this.getAnimatedItemCard();
          var distance = Math.min(animatedItemCard.defaultLeftValue + $event.deltaX, animatedItemCard.defaultLeftValue);

          Velocity(animatedItemCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 1,
            promise: true
          });
        },

        hideNextItemCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedItemCard = this.getAnimatedItemCard();

          Velocity(animatedItemCard.el, {
            left: animatedItemCard.defaultLeftValue
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this.itemCardShowingPartially = false;
              this._broadcastNextItemHidden();
            }.bind(this)
          });
        },

        showPreviousItemCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            this.setAnimatedItemCardToEndState();
          }

          this.itemCardShowingFully = true;

          var animatedItemCard = this.getAnimatedItemCard();

          Velocity(animatedItemCard.el, {
            left: animatedItemCard.defaultLeft
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this._broadcastPreviousItemShown();
              this.setAnimatedItemCardToDefaultState();
              this.itemCardShowingFully = false;
            }.bind(this)
          });

          this.itemCardShowingPartially = false;
        },

        showPreviousItemCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          if (!this.isShowingPartially()) {
            this.setAnimatedItemCardToEndState();
          }

          this.itemCardShowingPartially = true;

          var animatedItemCard = this.getAnimatedItemCard();
          var distance = Math.max(animatedItemCard.endLeftValue + $event.deltaX, animatedItemCard.endLeftValue);

          Velocity(animatedItemCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 1,
            promise: true
          });
        },

        hidePreviousItemCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedItemCard = this.getAnimatedItemCard();

          Velocity(animatedItemCard.el, {
            left: animatedItemCard.endLeftValue
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this.itemCardShowingPartially = false;
              this.setAnimatedItemCardToDefaultState();
              this._broadcastPreviousItemHidden();
            }.bind(this)
          });
        },

        endShowItemCardPartially: function (e, $event, distance) {
          if (this.isShowingFully()) {
            return;
          }

          //var diff = this.getCurrentLeftDifferenceValue();
          var absDistance = Math.abs(distance);
          var minDistance = this.getWindowWidth() / 3.0;

          //if (distance < 0 ? (absDistance < minDistance) : (absDistance > minDistance)) {
          if (absDistance < minDistance) {
            distance < 0 ? this.hideNextItemCardFully() : this.hidePreviousItemCardFully();
          } else {
            distance < 0 ? this.showNextItemCardFully() : this.showPreviousItemCardFully();
          }
        },

        isShowingFully: function () {
          return this.itemCardShowingFully;
        },

        isShowingPartially: function () {
          return this.itemCardShowingPartially;
        },

        _broadcastNextItemShown: function () {
          scope.$broadcast('stack:nextItemShown');
        },

        _broadcastPreviousItemShown: function () {
          scope.$broadcast('stack:previousItemShown');
        },

        _broadcastNextItemHidden: function () {
          scope.$broadcast('stack:nextItemHidden');
        },

        _broadcastPreviousItemHidden: function () {
          scope.$broadcast('stack:previousItemHidden');
        }
      }, scope.stack.view);


      /* Stack expand view */

      scope.stack.view = angular.extend({
        verticalDistance: 0,

        resetStartPoint: function () {
          this.touchStartX = null;
          this.touchStartY = null;
        },

        expandView: function (e) {
          if (this.isExpanded()) {
            return;
          }

          if (this.isExpandingFully() || this.isShowingPartially()) {
            return;
          }

          var touch = e.changedTouches[0] || e.touches[0];
          var x = touch.pageX;
          var y = touch.pageY;

          if (this.touchStartX === null && this.touchStartY === null) {
            this.touchStartX = x;
            this.touchStartY = y;
          }

          this.deltaX = this.touchStartX - x;
          this.deltaY = this.touchStartY - y;

          var absDeltaY = Math.abs(this.deltaY);
          var absDeltaX = Math.abs(this.deltaX);

          if (this.deltaY < 0 && absDeltaY > absDeltaX) {
            this.expandViewPartially();
          }
        },

        expandViewFully: function () {
          if (this.isExpandingFully()) {
            return;
          }

          var el = this.getStackElement();
          var listEl = this.getItemCardListElement();
          var fakeListEl = this.getFakeItemCardListElement();
          var translateY = this.getWindowHeight();

          this.expandingFully = true;

          Velocity(listEl, {
            opacity: 1
          }, {
            duration: 1
          });

          Velocity(el, {
            translateY: translateY,
            scale: 0
          }, {
            duration: 150,
            complete: function () {
              this.expandingPatially = false;
              this.expandingFully = false;
              this._broadcastExpandedView();
            }.bind(this)
          });
        },

        expandViewPartially: function () {
          if (this.isExpandingFully()) {
            return;
          }

          if (!this.isExpandingPartially()) {
            this.expandingPatially = true;
            this._broadcastExpandingViewPartially();
          }

          var el = this.getStackElement();
          var fakeListEl = this.getFakeItemCardListElement();
          var height = this.getWindowHeight();
          var translateY = Math.min(0, this.deltaY);
          var scale = translateY !== 0 ? Math.min(1, 1 - Math.abs(this.deltaY) / height) : 1;
          var opacity = 1 - scale;

          Velocity(el, {
            translateY: -translateY,
            scale: scale
          }, {
            duration: 1
          });

          Velocity(fakeListEl, {
            opacity: opacity
          }, {
            duration: 1
          });
        },

        endExpandingPartially: function () {
          if (!this.isExpandingPartially()) {
            return;
          }

          if (this.isExpandingFully()) {
            return;
          }

          var stackEl = this.getStackElement();
          var fakeListEl = this.getFakeItemCardListElement();

          var absDeltaY = Math.abs(this.deltaY);

          if (absDeltaY > this.getWindowHeight() / 4) {
            this.expandViewFully();
          } else {
            Velocity(stackEl, {
              translateY: 0,
              scale: 1
            }, {
              duration: 50,
              complete: function () {
                this.expandingFully = false;
                this.expandingPatially = false;
              }.bind(this)
            });

            Velocity(fakeListEl, {
              opacity: 0
            }, {
              duration: 50
            });
          }
        },

        stackedView: function () {
          var stackEl = this.getStackElement();
          var listEl = this.getItemCardListElement();
          var fakeListEl = this.getFakeItemCardListElement();

          Velocity(fakeListEl, {
            opacity: 0
          }, {
            duration: 1
          });

          Velocity(listEl, {
            opacity: 0
          }, {
            duration: 150,
            display: 'inline-block',
            complete: function () {

              this._broadcastStackedView();

              Velocity(stackEl, {
                translateY: 0,
                scale: 1
              }, {
                duration: 200,
                display: 'inline-block',
                complete: function () {
                }.bind(this)
              });

            }.bind(this)
          });
        },

        isExpandingPartially: function () {
          return this.expandingPatially;
        },

        isExpandingFully: function () {
          return this.expandingFully;
        },

        isExpanded: function () {
          return scope.stack.isExpandedView();
        },

        _broadcastStackedView: function () {
          scope.$broadcast('stack:stackedView');
        },

        _broadcastExpandedView: function () {
          scope.$broadcast('stack:expandedView');
        },

        _broadcastExpandingViewPartially: function () {
          scope.$broadcast('stack:expandingViewPartially');
        }
      }, scope.stack.view);


      /* Initialize */

      scope.stack.view.initialize();
    }
  }
}]);

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
  }])

  .factory('CatalogShelvesResource', ['$resource', function ($resource) {
    return $resource(CONFIG.api.href + '/a/4/u/' + CONFIG.api.login + '/a/subscribed.json', {
      'auth_token': CONFIG.api.token
    })
  }]);

app.popup.messages.controller('MessagesCtrl', ['$scope', function ($scope) {
  $scope.messages = {
    active: false,

    list: [{
      user: {
        photo: '/src/images/photo1.png',
        name: 'Alex Gusev'
      },
      time: '19:33',
      text: 'у нас в тльятти это слово немного по-другому произносят'
    }, {
      user: {
        photo: '/src/images/photo2.png',
        name: 'NYtimes'
      },
      time: 'yesterday',
      text: 'Highly recommend this book for you'
    }],

    initialize: function () {
      this.setEventListeners();
    },

    setEventListeners: function () {
      $scope.$on('popup:deactivated', this.deactivate.bind(this));
      $scope.$on('notifications:activated', this.deactivate.bind(this));
    },

    activate: function () {
      if (this.isActive()) {
        return;
      }

      this.active = true;
      this._broadcastMessagesActivated();
    },

    deactivate: function () {
      this.active = false;
    },

    isActive: function () {
      return this.active;
    },

    _broadcastMessagesActivated: function () {
      $scope.$broadcast('messages:activated');
    }
  };

  $scope.messages.initialize();
}]);

app.popup.messages.directive('messages', function () {
  return {
    restrict: 'E',
    controller: 'MessagesCtrl',
    link: function (scope, el, attrs) {
      scope.messages.view = {

      };


    }
  };
});

app.popup.notifications.controller('NotificationsCtrl', ['$scope', function ($scope) {
  $scope.notifications = {
    active: false,

    list: [{
      user: {
        photo: '/src/images/photo1.png',
        name: 'Alex Gusev'
      },
      time: '19:33',
      text: 'понравилась ваша цитата'
    }, {
      user: {
        photo: '/src/images/photo2.png',
        name: 'NYtimes'
      },
      time: 'yesterday',
      text: 'Добавил вашу книгу из полки'
    }],

    initialize: function () {
      this.setEventListeners();
    },

    setEventListeners: function () {
      $scope.$on('popup:deactivated', this.deactivate.bind(this));
      $scope.$on('messages:activated', this.deactivate.bind(this));
    },

    activate: function () {
      if (this.isActive()) {
        return;
      }

      this.active = true;
      this._broadcastMessagesActivated();
    },

    deactivate: function () {
      this.active = false;
    },

    isActive: function () {
      return this.active;
    },

    _broadcastMessagesActivated: function () {
      $scope.$broadcast('notifications:activated');
    }
  };

  $scope.notifications.initialize();
}]);

app.popup.notifications.directive('notifications', function () {
  return {
    restrict: 'E',
    controller: 'NotificationsCtrl',
    link: function (scope, el, attrs) {
      scope.notifications.view = {

      };

    }
  };
});

app.popup.search.controller('SearchCtrl', ['$scope', function ($scope) {
  $scope.search = {
    active: false,

    initialize: function () {
      this.setEventListeners();
    },

    setEventListeners: function () {
      $scope.$on('popup:deactivated', this.deactivate.bind(this));
    },

    activate: function () {
      if (this.isActive()) {
        return;
      }

      this.active = true;
      this._broadcastMessagesActivated();
    },

    deactivate: function () {
      this.active = false;
    },

    isActive: function () {
      return this.active;
    },

    _broadcastMessagesActivated: function () {
      $scope.$broadcast('search:activated');
    }
  };

  $scope.search.initialize();
}]);

app.popup.search.directive('search', function () {
  return {
    restrict: 'E',
    controller: 'SearchCtrl',
    link: function (scope, el, attrs) {
      scope.search.view = {
        inputEl: document.getElementById('search-input'),

        focus: function () {
          this.inputEl.focus();
        }
      };

    }
  };
});
