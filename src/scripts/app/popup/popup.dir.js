app.popup.directive('popup', function () {
  return {
    restrict: 'E',
    controller: 'PopupCtrl',
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

        showPopup: function () {
          if (this.scaleVisibleState) {
            this.scalePopupToHiddenState(1);
          }

          Velocity(this.wrapperEl, {
            opacity: 1
          }, {
            display: 'inline-block',
            duration: 10,
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
            scaleX: 0,
            scaleY: 0
          }, {
            duration: duration || 300
          });

          this.scaleVisibleState = false;
        },

        scalePopupToVisibleState: function (duration) {
          Velocity(this.popupEl, {
            scaleX: 1,
            scaleY: 1
          }, {
            duration: duration || 300
          });

          this.scaleVisibleState = true;
        }
      };

      scope.popup.view.initialize();
    }
  };
});
