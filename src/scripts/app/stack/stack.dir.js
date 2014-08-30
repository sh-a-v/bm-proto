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

          scope.$on('stack:showPreviousBookFully', this.showPreviousBookCardFully.bind(this));
          scope.$on('stack:showPreviousBookPartially', this.showPreviousBookCardPartially.bind(this));

          scope.$on('stack:endShowBookPartially', this.endShowBookCardPartially.bind(this));
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
            this.animatedBookCard.endLeft = -1 * this.getWindowWidth() + this.animatedBookCard.defaultLeftValue + 'px';
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

        showNextBookCardFully: function (e, $event) {
          console.log('showNextBookCardFully');
          this.activateAnimatedBookCard();

          this.bookCardShowingFully = true;

          var animatedBookCard = this.getAnimatedBookCard();

          //Velocity(animatedBookCard.el, 'stop');
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
          });

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
          });
        },

        hideNextBookCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedBookCard = this.getAnimatedBookCard();

          //Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.defaultLeftValue
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true,
            complete: function () {
              this.bookCardShowingPartially = false;
              this._broadcastNextBookHidden();
            }.bind(this)
          });
        },

        showPreviousBookCardFully: function (e, $event) {
          console.log('showPreviousBookCardFully');
          if (!this.isShowingPartially()) {
            this.setAnimatedBookCardToEndState();
          }

          this.bookCardShowingFully = true;

          var animatedBookCard = this.getAnimatedBookCard();

          //Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.defaultLeft
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true,
            complete: function () {
              this._broadcastPreviousBookShown();
              this.setAnimatedBookCardToDefaultState();
              this.bookCardShowingFully = false;
            }.bind(this)
          });

          this.bookCardShowingPartially = false;
        },

        showPreviousBookCardPartially: function (e, $event) {
          console.log('showPreviousBookCardPartially');
          if (this.isShowingFully()) {
            return;
          }

          if (!this.isShowingPartially()) {
            this.setAnimatedBookCardToEndState();
          }

          this.bookCardShowingPartially = true;

          var animatedBookCard = this.getAnimatedBookCard();
          var distance = Math.max(animatedBookCard.endLeftValue + $event.deltaX, animatedBookCard.endLeftValue);

          Velocity(animatedBookCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 0,
            promise: true
          });
        },

        hidePreviousBookCardFully: function (e, $event) {
          if (!this.isShowingPartially()) {
            return;
          }

          var animatedBookCard = this.getAnimatedBookCard();

          //Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.endLeftValue
          }, {
            display: 'inline-block',
            duration: 200,
            promise: true,
            complete: function () {
              this.bookCardShowingPartially = false;
              this.setAnimatedBookCardToDefaultState();
              this._broadcastPreviousBookHidden();
            }.bind(this)
          });
          console.log('hidePreviousBookCardFully');
        },

        endShowBookCardPartially: function (e, $event, distance) {
          if (this.isShowingFully()) {
            return;
          }

          var diff = this.getCurrentLeftDifferenceValue();
          var minDistance = this.getWindowWidth() / 3.0;

          if (distance < 0 ? (diff < minDistance) : (diff > minDistance)) {
            distance < 0 ? this.hideNextBookCardFully() : this.hidePreviousBookCardFully();
          } else {
            distance < 0 ? this.showNextBookCardFully() : this.showPreviousBookCardFully();
          }
        },

        isShowingFully: function () {
          return this.bookCardShowingFully;
        },

        isShowingPartially: function () {
          return this.bookCardShowingPartially;
        },

        _broadcastNextBookShown: function () {
          scope.$broadcast('stack:nextBookShown');
        },

        _broadcastPreviousBookShown: function () {
          scope.$broadcast('stack:previousBookShown');
        },

        _broadcastNextBookHidden: function () {
          scope.$broadcast('stack:nextBookHidden');
        },

        _broadcastPreviousBookHidden: function () {
          scope.$broadcast('stack:previousBookHidden');
        }
      };

      scope.stack.view.initialize();
    }
  }
}]);
