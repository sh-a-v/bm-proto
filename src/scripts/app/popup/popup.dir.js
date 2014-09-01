app.popup.directive('popup', ['$window', function ($window) {
  return {
    restrict: 'E',
    controller: 'PopupCtrl',
    templateUrl: 'popup.html',
    link: function (scope, el, attrs) {
      scope.popup.view = {
        wrapperEl: document.getElementById('popup-wrapper'),
        popupEl: el,
        scaleVisibleState: true,

        initialize: function () {
          this.setEventListeners();
        },

        setEventListeners: function () {
          scope.$on('popup:activated', this.showPopup.bind(this));
          scope.$on('popup:deactivated', this.hidePopup.bind(this));
        },

        getWindowWidth: function () {
          if (!this.windowWidth) {
            this.windowWidth = $window.innerWidth;
          }

          return this.windowWidth;
        },

        getWindowHeight: function () {
          if (!this.windowHeight) {
            this.windowHeight = $window.innerHeight;
          }

          return this.windowHeight;
        },

        showPopup: function () {
          if (this.scaleVisibleState) {
            this.scalePopupToHiddenState(1);
          }

          Velocity(this.wrapperEl, {
            opacity: 1
          }, {
            display: 'inline-block',
            duration: 1,
            complete: function () {
              this.scalePopupToVisibleState();
            }.bind(this)
          });
        },

        hidePopup: function () {
          Velocity(this.wrapperEl, {
            opacity: 0
          }, {
            display: 'none',
            duration: 100,
            begin: function () {
              this.scalePopupToHiddenState();
            }.bind(this)
          });
        },

        scalePopupToHiddenState: function (duration) {
          Velocity(this.popupEl, {
            height: '10%'
          }, {
            duration: duration || 200
          });

          this.scaleVisibleState = false;
        },

        scalePopupToVisibleState: function (duration) {
          Velocity(this.popupEl, {
            height: '100%'
          }, {
            duration: duration || 200
          });

          this.scaleVisibleState = true;
        }
      };

      scope.popup.view.initialize();
    }
  };
}]);
