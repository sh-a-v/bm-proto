app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {
      scope.stack.view = {
        elWidth: 308,
        defaultDuration: 500,

        initialize: function () {
          this.setEventListeners();
        },

        setEventListeners: function () {
          scope.$on('stack:showNextBookFully', this.showNextBookCardFully.bind(this));
          scope.$on('stack:showNextBookPartially', this.showNextBookCardPartially.bind(this));
          scope.$on('stack:endShowNextBookPartially', this.endShowNextBookCardPartially.bind(this));
          scope.$on('stack:showPreviousBookFully', this.showPreviousBookCardFully.bind(this));
        },

        getWindowWidth: function () {
          if (!this.windowWidth) {
            this.windowWidth = $window.innerWidth;
          }

          return this.windowWidth;
        },

        getCurrentLeftValue: function () {
          var animatedBookCard = this.getAnimatedBookCard();

          return this.isShowingPartially() ? parseInt(animatedBookCard.el.style.left) : animatedBookCard.defaultLeftValue;
        },

        getCurrentLeftDifferenceValue: function () {
          var animatedBookCard = this.getAnimatedBookCard();

          return Math.abs(Math.abs(animatedBookCard.defaultLeftValue) - Math.abs(this.getCurrentLeftValue()));
        },

        getAnimatedBookCard: function () {
          if (!this.animatedBookCard) {
            this.animatedBookCard = {};
            this.animatedBookCard.el = document.getElementById('animated-book-card');
            this.animatedBookCard.defaultLeft = $window.getComputedStyle(this.animatedBookCard.el).left;
            this.animatedBookCard.defaultLeftValue = this.animatedBookCard.defaultLeft.indexOf('%') ? this.getWindowWidth() * parseInt(this.animatedBookCard.defaultLeft) / 100 : parseInt(this.animatedBookCard.defaultLeft);
            this.animatedBookCard.endLeft = -1 * this.getWindowWidth() + 'px';
            this.animatedBookCard.endLeftValue = parseInt(this.animatedBookCard.endLeft);
            this.animatedBookCard.width = this.elWidth;
          }

          return this.animatedBookCard;
        },

        activateAnimatedBookCard: function () {
          if (this.active) {
            return;
          }

          this.active = true;
          this.getAnimatedBookCard().el.style.display = 'inline-block';
        },

        deactivateAnimatedBookCard: function () {
          if (!this.active) {
            return;
          }

          this.active = false;
          this.getAnimatedBookCard().el.style.display = 'none';
        },

        setAnimatedBookCardToDefaultState: function () {
          this.deactivateAnimatedBookCard();
          this.getAnimatedBookCard().el.style.left = '';
        },

        setAnimatedBookCardToEndState: function () {
          this.getAnimatedBookCard().el.style.left = this.getAnimatedBookCard().endLeft;
          this.activateAnimatedBookCard();
        },

        showNextBookCardFully: function (e, $event) {//return;
          this.activateAnimatedBookCard();

          this.bookCardShowingFully = true;

          var animatedBookCard = this.getAnimatedBookCard();

          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.endLeft
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true,
            complete: function () {
              this._broadcastNextBookShown();
              this.setAnimatedBookCardToDefaultState();
              this.bookCardShowingFully = false;
            }.bind(this)
          }).then(function () {
          }.bind(this));

          this.bookCardShowingPartially = false;
        },

        showNextBookCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          this.activateAnimatedBookCard();
          this.bookCardShowingPartially = true;

          var animatedBookCard = this.getAnimatedBookCard();
          var distance = Math.min(animatedBookCard.defaultLeftValue + $event.deltaX, animatedBookCard.defaultLeftValue);

          Velocity(animatedBookCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 0,
            promise: true
          }).then(function () {
          }.bind(this));
        },

        hideNextBookCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedBookCard = this.getAnimatedBookCard();

          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.defaultLeftValue
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true
          });
        },

        endShowNextBookCardPartially: function (e, $event) {
          if (this.isShowingFully()) {
            return;
          }

          if (this.getCurrentLeftDifferenceValue() < this.getWindowWidth() / 2.5) {
            this.hideNextBookCardFully();
          } else {
            this.showNextBookCardFully();
          }
        },

        showPreviousBookCardFully: function (e, $event) {
          this.setAnimatedBookCardToEndState();

          this.bookCardShowingFully = true;

          var animatedBookCard = this.getAnimatedBookCard();

          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.defaultLeft
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true,
            complete: function () {
              //this._broadcastPreviousBookShown();
              //this.setAnimatedBookCardToDefaultState();
              this.bookCardShowingFully = false;
            }.bind(this)
          }).then(function () {
          }.bind(this));

          this.bookCardShowingPartially = false;
        },

        isShowingFully: function () {
          return this.bookCardShowingFully;
        },

        isShowingPartially: function () {
          return this.bookCardShowingPartially;
        },

        _broadcastNextBookShown: function () {
          scope.$broadcast('stack:nextBookShown');
        }
      };

      scope.stack.view.initialize();
    }
  }
}]);
