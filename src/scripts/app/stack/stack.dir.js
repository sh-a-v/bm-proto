app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {
      var windowWidth = $window.innerWidth;
      var animatedBookCardEl = document.getElementById('animated-book-card');
      var animatedBookCardElDefaultLeft = $window.getComputedStyle(animatedBookCardEl).left;
      var animatedBookCardElLeft = -1 * windowWidth + 'px';
      var animatedBookCardElDuration = 300;

      var showNextBookCard = function () {
        animatedBookCardEl.style.display = '';
        animatedBookCardEl.style.left = animatedBookCardElDefaultLeft;

        if (scope.reverseTimeout) {
          clearTimeout(scope.reverseTimeout);
        }

        Velocity(animatedBookCardEl, {
          left: animatedBookCardElLeft
        }, {
          display: 'inline-block',
          duration: animatedBookCardElDuration,
          promise: true
        });

        scope.reverseTimeout = setTimeout(function () {
          scope.$broadcast('stack:nextBookShown');
        }, animatedBookCardElDuration);
      };

      var showPreviousBookCard = function () {
        animatedBookCardEl.style.left = animatedBookCardElLeft;
        animatedBookCardEl.style.left = 'inline-block';

        if (scope.reverseTimeout) {
          clearTimeout(scope.reverseTimeout);
        }

        Velocity(animatedBookCardEl, {
          left: animatedBookCardElDefaultLeft
        }, {
          //display: 'none',
          duration: animatedBookCardElDuration,
          promise: true
        });

        scope.reverseTimeout = setTimeout(function () {
          scope.$broadcast('stack:previousBookShown');
        }, animatedBookCardElDuration);
      };

      scope.$on('stack:showNextBook', showNextBookCard);
      scope.$on('stack:showPreviousBook', showPreviousBookCard);
    }
  }
}]);
