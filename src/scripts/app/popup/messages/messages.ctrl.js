app.popup.messages.controller('MessagesCtrl', ['$scope', function ($scope) {
  $scope.messages = {
    active: false,

    list: [{
      user: {
        photo: '/src/images/photo1.png',
        name: 'Alex Gusev'
      },
      time: '19:33',
      text: 'у нас в тльятти это слово немного по-другому произносят'
    }, {
      user: {
        photo: '/src/images/photo2.png',
        name: 'NYtimes'
      },
      time: 'yesterday',
      text: 'Highly recommend this book for you'
    }],

    initialize: function () {
      this.setEventListeners();
    },

    setEventListeners: function () {
      $scope.$on('popup:deactivated', this.deactivate.bind(this));
      $scope.$on('notifications:activated', this.deactivate.bind(this));
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
      $scope.$broadcast('messages:activated');
    }
  };

  $scope.messages.initialize();
}]);
