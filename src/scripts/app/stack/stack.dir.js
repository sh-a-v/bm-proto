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
          scope.$on('stack:showNextBookFull', this.showNextBookCardFull.bind(this));
          scope.$on('stack:showNextBookPartially', this.showNextBookCardPartially.bind(this));
          scope.$on('stack:endShowNextBookPartially', this.endShowNextBookCardPartially.bind(this));
          //scope.$on('stack:showPreviousBook', showPreviousBookCard);
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

        getCalculatedDuration: function () {
          var animatedBookCard = this.getAnimatedBookCard();
          var fullWidth = Math.abs(Math.abs(animatedBookCard.defaultLeftValue) - Math.abs(animatedBookCard.endLeftValue));
          var diffWidth = this.isLeftDirection() ? fullWidth - this.getCurrentLeftDifferenceValue() : this.getCurrentLeftDifferenceValue();

          return this.defaultDuration * diffWidth / fullWidth;
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
          this.activateAnimatedBookCard();
          this.getAnimatedBookCard().el.style.left = animatedBookCardEl.endLeft;
        },

        showNextBookCardFull: function (e, $event) {//return;
          this.activateAnimatedBookCard();

          this.bookCardShowingFull = true;
          this.direction = 'left';

          var animatedBookCard = this.getAnimatedBookCard();
          //alert();
          Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: animatedBookCard.endLeft
          }, {
            display: 'inline-block',
            duration: 200, //this.getCalculatedDuration(),
            promise: true,
            complete: function () {
              this._broadcastNextBookShown();
              this.setAnimatedBookCardToDefaultState();
              this.bookCardShowingFull = false;
            }.bind(this)
          }).then(function () {
          }.bind(this));

          this.bookCardShowingPartially = false;
        },

        showNextBookCardPartially: function (e, $event) {
          if (this.isShowingFull()) {
            return;
          }

          this.activateAnimatedBookCard();
          this.bookCardShowingPartially = true;

          var animatedBookCard = this.getAnimatedBookCard();
          var distance = Math.min(animatedBookCard.defaultLeftValue + $event.deltaX, animatedBookCard.defaultLeftValue);

          //Velocity(animatedBookCard.el, 'stop');
          Velocity(animatedBookCard.el, {
            left: distance
          }, {
            display: 'inline-block',
            duration: 0,
            promise: true
          }).then(function () {
          }.bind(this));
        },

        hideNextBookCardFull: function (e, $event) {
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
          }).then(function () {
            //console.log('end', this.direction);
            //
          }.bind(this));

          this.direction = 'right';
        },

        endShowNextBookCardPartially: function (e, $event) {
          if (this.isShowingFull()) {
            return;
          }


          if (this.getCurrentLeftDifferenceValue() < this.getWindowWidth() / 2.5) {
            this.hideNextBookCardFull();
          } else {
            this.showNextBookCardFull();
          }
        },

        showPreviousBookCardFull: function (e, $event) {
          this.direction = 'right';
        },

        isShowingFull: function () {
          return this.bookCardShowingFull;
        },

        isShowingPartially: function () {
          return this.bookCardShowingPartially;
        },

        isLeftDirection: function () {
          return this.direction === 'left';
        },

        _broadcastNextBookShown: function () {
          scope.$broadcast('stack:nextBookShown');
        }
      };

      scope.stack.view.initialize();
    }
  }
}]);
