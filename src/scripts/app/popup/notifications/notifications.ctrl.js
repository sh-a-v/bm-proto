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
