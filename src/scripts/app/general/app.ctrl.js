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
