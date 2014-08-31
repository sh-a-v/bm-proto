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
