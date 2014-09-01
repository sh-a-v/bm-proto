app.popup.notifications.directive('notifications', function () {
  return {
    restrict: 'E',
    controller: 'NotificationsCtrl',
    link: function (scope, el, attrs) {
      scope.notifications.view = {

      };

    }
  };
});
