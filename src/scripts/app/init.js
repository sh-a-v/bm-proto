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
