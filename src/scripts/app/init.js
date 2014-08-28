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
