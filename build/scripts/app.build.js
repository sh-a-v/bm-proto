'use strict';

var app = angular.module('app', ['ui.router', 'ngResource', 'ngTouch', 'app.stack']);

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

app.controller('AppCtrl', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
  $scope.app = {
    $state: $state,
    savedState: {
      home: 'home.now',
      catalog: 'catalog.all'
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

  console.log('state:', $scope.app.$state);
}]);

app.stack = angular.module('app.stack', []);

app.stack
  .controller('StackCtrl', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
    //console.log($state);
  }]);

app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {

    }
  }
}]);
