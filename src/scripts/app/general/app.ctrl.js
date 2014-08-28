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
