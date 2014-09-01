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
