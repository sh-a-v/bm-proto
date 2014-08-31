app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {
      scope.stack.view = {
        elWidth: 308,
        defaultDuration: 150,

        initialize: function () {
          this.setEventListeners();
        },

        setEventListeners: function () {
          scope.$on('stack:showNextItemFully', this.showNextItemCardFully.bind(this));
          scope.$on('stack:showNextItemPartially', this.showNextItemCardPartially.bind(this));

          scope.$on('stack:showPreviousItemFully', this.showPreviousItemCardFully.bind(this));
          scope.$on('stack:showPreviousItemPartially', this.showPreviousItemCardPartially.bind(this));

          scope.$on('stack:endShowItemPartially', this.endShowItemCardPartially.bind(this));
        },

        getWindowWidth: function () {
          if (!this.windowWidth) {
            this.windowWidth = $window.innerWidth;
          }

          return this.windowWidth;
        },

        getCurrentLeftValue: function () {
          var animatedItemCard = this.getAnimatedItemCard();

          return this.isShowingPartially() ? parseInt(animatedItemCard.el.style.left) : animatedItemCard.defaultLeftValue;
        },

        getCurrentLeftDifferenceValue: function () {
          var animatedItemCard = this.getAnimatedItemCard();

          return Math.abs(Math.abs(animatedItemCard.defaultLeftValue) - Math.abs(this.getCurrentLeftValue()));
        },

        getAnimatedItemCard: function () {
          if (!this.animatedItemCard) {
            this.animatedItemCard = {};
            this.animatedItemCard.el = document.getElementById('animated-item-card');
            this.animatedItemCard.defaultLeft = $window.getComputedStyle(this.animatedItemCard.el).left;
            this.animatedItemCard.defaultLeftValue = this.animatedItemCard.defaultLeft.indexOf('%') ? this.getWindowWidth() * parseInt(this.animatedItemCard.defaultLeft) / 100 : parseInt(this.animatedItemCard.defaultLeft);
            this.animatedItemCard.endLeft = -1 * this.getWindowWidth() + this.animatedItemCard.defaultLeftValue + 'px';
            this.animatedItemCard.endLeftValue = parseInt(this.animatedItemCard.endLeft);
            this.animatedItemCard.width = this.elWidth;
          }

          return this.animatedItemCard;
        },

        activateAnimatedItemCard: function () {
          if (this.active) {
            return;
          }

          this.active = true;
          this.getAnimatedItemCard().el.style.display = 'inline-block';
        },

        deactivateAnimatedItemCard: function () {
          if (!this.active) {
            return;
          }

          this.active = false;
          this.getAnimatedItemCard().el.style.display = 'none';
        },

        setAnimatedItemCardToDefaultState: function () {
          this.deactivateAnimatedItemCard();
          this.getAnimatedItemCard().el.style.left = '';
        },

        setAnimatedItemCardToEndState: function () {
          this.getAnimatedItemCard().el.style.left = this.getAnimatedItemCard().endLeft;
          this.activateAnimatedItemCard();
        },

        showNextItemCardFully: function (e, $event) {
          this.activateAnimatedItemCard();

          this.itemCardShowingFully = true;

          var animatedItemCard = this.getAnimatedItemCard();

          //Velocity(animatedItemCard.el, 'stop');
          Velocity(animatedItemCard.el, {
            left: animatedItemCard.endLeft
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this._broadcastNextItemShown();
              this.setAnimatedItemCardToDefaultState();
              this.itemCardShowingFully = false;
            }.bind(this)
          });

          this.itemCardShowingPartially = false;
        },

        showNextItemCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          this.activateAnimatedItemCard();
          this.itemCardShowingPartially = true;

          var animatedItemCard = this.getAnimatedItemCard();
          var distance = Math.min(animatedItemCard.defaultLeftValue + $event.deltaX, animatedItemCard.defaultLeftValue);

          Velocity(animatedItemCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 1,
            promise: true
          });
        },

        hideNextItemCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedItemCard = this.getAnimatedItemCard();

          //Velocity(animatedItemCard.el, 'stop');
          Velocity(animatedItemCard.el, {
            left: animatedItemCard.defaultLeftValue
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this.itemCardShowingPartially = false;
              this._broadcastNextItemHidden();
            }.bind(this)
          });
        },

        showPreviousItemCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            this.setAnimatedItemCardToEndState();
          }

          this.itemCardShowingFully = true;

          var animatedItemCard = this.getAnimatedItemCard();

          //Velocity(animatedItemCard.el, 'stop');
          Velocity(animatedItemCard.el, {
            left: animatedItemCard.defaultLeft
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this._broadcastPreviousItemShown();
              this.setAnimatedItemCardToDefaultState();
              this.itemCardShowingFully = false;
            }.bind(this)
          });

          this.itemCardShowingPartially = false;
        },

        showPreviousItemCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          if (!this.isShowingPartially()) {
            this.setAnimatedItemCardToEndState();
          }

          this.itemCardShowingPartially = true;

          var animatedItemCard = this.getAnimatedItemCard();
          var distance = Math.max(animatedItemCard.endLeftValue + $event.deltaX, animatedItemCard.endLeftValue);

          Velocity(animatedItemCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 1,
            promise: true
          });
        },

        hidePreviousItemCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedItemCard = this.getAnimatedItemCard();

          //Velocity(animatedItemCard.el, 'stop');
          Velocity(animatedItemCard.el, {
            left: animatedItemCard.endLeftValue
          }, {
            display: 'inline-block',
            duration: this.defaultDuration,
            promise: true,
            complete: function () {
              this.itemCardShowingPartially = false;
              this.setAnimatedItemCardToDefaultState();
              this._broadcastPreviousItemHidden();
            }.bind(this)
          });
        },

        endShowItemCardPartially: function (e, $event, distance) {
          if (this.isShowingFully()) {
            return;
          }

          //var diff = this.getCurrentLeftDifferenceValue();
          var absDistance = Math.abs(distance);
          var minDistance = this.getWindowWidth() / 3.0;

          //if (distance < 0 ? (absDistance < minDistance) : (absDistance > minDistance)) {
          if (absDistance < minDistance) {
            distance < 0 ? this.hideNextItemCardFully() : this.hidePreviousItemCardFully();
          } else {
            distance < 0 ? this.showNextItemCardFully() : this.showPreviousItemCardFully();
          }
        },

        isShowingFully: function () {
          return this.itemCardShowingFully;
        },

        isShowingPartially: function () {
          return this.itemCardShowingPartially;
        },

        _broadcastNextItemShown: function () {
          scope.$broadcast('stack:nextItemShown');
        },

        _broadcastPreviousItemShown: function () {
          scope.$broadcast('stack:previousItemShown');
        },

        _broadcastNextItemHidden: function () {
          scope.$broadcast('stack:nextItemHidden');
        },

        _broadcastPreviousItemHidden: function () {
          scope.$broadcast('stack:previousItemHidden');
        }
      };

      scope.stack.view.initialize();
    }
  }
}]);
