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
