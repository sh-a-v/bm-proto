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
      templateUrl: 'stack.html',
      type: 'book'
    })
    .state('home.want', {
      url: '/want',
      title: 'Want to read',
      resource: 'UserBookListReadWantResource',
      templateUrl: 'stack.html',
      type: 'book'
    })
    .state('home.all', {
      url: '/all',
      title: 'All books',
      resource: 'UserBookListAllResource',
      templateUrl: 'stack.html',
      type: 'book'
    })
    .state('home.quotes', {
      url: '/quotes',
      title: 'Quotes',
      resource: 'UserMarkersResource',
      templateUrl: 'stack.html',
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
      templateUrl: 'stack.html',
      type: 'book'
    })
    .state('catalog.friends', {
      url: '/friends',
      title: 'Friends',
      resource: 'CatalogFriendsResource',
      templateUrl: 'stack.html',
      type: ''
    })
    .state('catalog.popular', {
      url: '/popular',
      title: 'Popular',
      resource: 'CatalogPopularResource',
      templateUrl: 'stack.html',
      type: 'book'
    })
    .state('catalog.shelves', {
      url: '/shelves',
      title: 'Shelves',
      templateUrl: 'stack.html',
      type: 'shelf'
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

app.popup = angular.module('app.popup', []);

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

app.popup.controller('PopupCtrl', ['$scope', function ($scope) {
  $scope.popup = {
    active: false,

    activate: function () {
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

    stop: function () {
      console.log('stopped');
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
}]);

app.popup.directive('popup', function () {
  return {
    restrict: 'E',
    controller: 'PopupCtrl',
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

        showPopup: function () {
          if (this.scaleVisibleState) {
            this.scalePopupToHiddenState(1);
          }

          Velocity(this.wrapperEl, {
            opacity: 1
          }, {
            display: 'inline-block',
            duration: 10,
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
            scaleX: 0,
            scaleY: 0
          }, {
            duration: duration || 300
          });

          this.scaleVisibleState = false;
        },

        scalePopupToVisibleState: function (duration) {
          Velocity(this.popupEl, {
            scaleX: 1,
            scaleY: 1
          }, {
            duration: duration || 300
          });

          this.scaleVisibleState = true;
        }
      };

      scope.popup.view.initialize();
    }
  };
});

app.stack.controller('StackCtrl', [
  '$rootScope', '$scope', '$state', 'UserBookListReadNowResource', 'UserBookListReadWantResource', 'UserBookListAllResource', 'UserMarkersResource', 'CatalogNewResource', 'CatalogBestResource', 'CatalogPopularResource', 'CatalogFriendsResource',
  function ($rootScope, $scope, $state, UserBookListReadNowResource, UserBookListReadWantResource, UserBookListAllResource, UserMarkersResource, CatalogNewResource, CatalogBestResource, CatalogPopularResource, CatalogFriendsResource) {
    $scope.stack = {
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
        'CatalogFriendsResource': CatalogFriendsResource
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

      _handleRes: function (res) {
        if (angular.isObject(res) && res.objects) {
          res = res.objects;
        }

        angular.forEach(res, function (item) {
          item.type = $state.$current.type || '';
        }.bind(this));

        if ($state.$current.resource === 'UserMarkersResource') {
          var markersRes = [];

          angular.forEach(res, function (markers) {
            angular.forEach(markers[0], function (marker) {
              marker.type = 'quote';
              markersRes.push(marker);
            })
          }.bind(this));

          res = markersRes;
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

      getNextItemFully: function ($event) {
        console.log('next fully');
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

        this.previousDistance = this.distance || 0;
        this.distance = $event.deltaX;

        if (this.previousDistance < 0 && this.distance > 0) {
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
        defaultDuration: 150,

        initialize: function () {
          this.setEventListeners();
        },

        setEventListeners: function () {
          scope.$on('stack:showNextItemFully', this.showNextItemCardFully.bind(this));
          scope.$on('stack:showNextItemPartially', this.showNextItemCardPartially.bind(this));

          scope.$on('stack:showPreviousItemFully', this.showPreviousItemCardFully.bind(this));
          scope.$on('stack:showPreviousItemPartially', this.showPreviousItemCardPartially.bind(this));

          scope.$on('stack:endShowItemPartially', this.endShowItemCardPartially.bind(this));
        },

        getWindowWidth: function () {
          if (!this.windowWidth) {
            this.windowWidth = $window.innerWidth;
          }

          return this.windowWidth;
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
        },

        showNextItemCardFully: function (e, $event) {
          this.activateAnimatedItemCard();

          this.itemCardShowingFully = true;

          var animatedItemCard = this.getAnimatedItemCard();

          //Velocity(animatedItemCard.el, 'stop');
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

          //Velocity(animatedItemCard.el, 'stop');
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

          //Velocity(animatedItemCard.el, 'stop');
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

          //Velocity(animatedItemCard.el, 'stop');
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
      };

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
  }]);
