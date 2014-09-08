app.stack.directive('stack', ['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
  return {
    restrict: 'E',
    controller: 'StackCtrl',
    link: function (scope, el, attrs) {

      /* Stack general */

      scope.stack.view = {
        elWidth: 308,
        defaultDuration: 150,

        initialize: function () {
          this.setEventListeners();
          this.setElementEventListeners();
        },

        setEventListeners: function () {
          scope.$on('stack:showNextItemFully', this.showNextItemCardFully.bind(this));
          scope.$on('stack:showNextItemPartially', this.showNextItemCardPartially.bind(this));

          scope.$on('stack:showPreviousItemFully', this.showPreviousItemCardFully.bind(this));
          scope.$on('stack:showPreviousItemPartially', this.showPreviousItemCardPartially.bind(this));

          scope.$on('stack:endShowItemPartially', this.endShowItemCardPartially.bind(this));

          scope.$on('stack:stackedViewFromExpanded', this.stackedView.bind(this));
        },

        setElementEventListeners: function () {
          angular.element(el).bind('touchstart', this.resetStartPoint.bind(this));
          angular.element(el).bind('touchmove', this.expandView.bind(this));
          angular.element(el).bind('touchend', this.endExpandingPartially.bind(this));
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

        getStackElement: function () {
          if (!this.stackElement) {
            this.stackElement = document.getElementById('stack-block');
          }

          return this.stackElement;
        },

        getFakeItemCardListElement: function () {
          if (!this.fakeItemCardListElement) {
            this.fakeItemCardListElement = document.getElementById('fake-item-card-list-block');
          }

          return this.fakeItemCardListElement;
        },

        getItemCardListElement: function () {
          if (!this.itemCardListElement) {
            this.itemCardListElement = document.getElementById('item-card-list-block');
          }

          return this.itemCardListElement;
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
        }
      };


      /* Stack cards */

      scope.stack.view = angular.extend({
        showNextItemCardFully: function (e, $event) {
          this.activateAnimatedItemCard();

          this.itemCardShowingFully = true;

          var animatedItemCard = this.getAnimatedItemCard();

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
      }, scope.stack.view);


      /* Stack expand view */

      scope.stack.view = angular.extend({
        verticalDistance: 0,

        resetStartPoint: function () {
          this.touchStartX = null;
          this.touchStartY = null;
        },

        expandView: function (e) {
          if (this.isExpanded()) {
            return;
          }

          if (this.isExpandingFully() || this.isShowingPartially()) {
            return;
          }

          var touch = e.changedTouches[0] || e.touches[0];
          var x = touch.pageX;
          var y = touch.pageY;

          if (this.touchStartX === null && this.touchStartY === null) {
            this.touchStartX = x;
            this.touchStartY = y;
          }

          this.deltaX = this.touchStartX - x;
          this.deltaY = this.touchStartY - y;

          var absDeltaY = Math.abs(this.deltaY);
          var absDeltaX = Math.abs(this.deltaX);

          if (this.deltaY < 0 && absDeltaY > absDeltaX) {
            this.expandViewPartially();
          }
        },

        expandViewFully: function () {
          if (this.isExpandingFully()) {
            return;
          }

          var el = this.getStackElement();
          var listEl = this.getItemCardListElement();
          var fakeListEl = this.getFakeItemCardListElement();
          var translateY = this.getWindowHeight();

          this.expandingFully = true;

          Velocity(listEl, {
            opacity: 1
          }, {
            duration: 1
          });

          Velocity(el, {
            translateY: translateY,
            scale: 0
          }, {
            duration: 150,
            complete: function () {
              this.expandingPatially = false;
              this.expandingFully = false;
              this._broadcastExpandedView();
            }.bind(this)
          });
        },

        expandViewPartially: function () {
          if (this.isExpandingFully()) {
            return;
          }

          if (!this.isExpandingPartially()) {
            this.expandingPatially = true;
            this._broadcastExpandingViewPartially();
          }

          var el = this.getStackElement();
          var fakeListEl = this.getFakeItemCardListElement();
          var height = this.getWindowHeight();
          var translateY = Math.min(0, this.deltaY);
          var scale = translateY !== 0 ? Math.min(1, 1 - Math.abs(this.deltaY) / height) : 1;
          var opacity = 1 - scale;

          Velocity(el, {
            translateY: -translateY,
            scale: scale
          }, {
            duration: 1
          });

          Velocity(fakeListEl, {
            opacity: opacity
          }, {
            duration: 1
          });
        },

        endExpandingPartially: function () {
          if (!this.isExpandingPartially()) {
            return;
          }

          if (this.isExpandingFully()) {
            return;
          }

          var stackEl = this.getStackElement();
          var fakeListEl = this.getFakeItemCardListElement();

          var absDeltaY = Math.abs(this.deltaY);

          if (absDeltaY > this.getWindowHeight() / 4) {
            this.expandViewFully();
          } else {
            Velocity(stackEl, {
              translateY: 0,
              scale: 1
            }, {
              duration: 50,
              complete: function () {
                this.expandingFully = false;
                this.expandingPatially = false;
              }.bind(this)
            });

            Velocity(fakeListEl, {
              opacity: 0
            }, {
              duration: 50
            });
          }
        },

        stackedView: function () {
          var stackEl = this.getStackElement();
          var listEl = this.getItemCardListElement();
          var fakeListEl = this.getFakeItemCardListElement();

          Velocity(fakeListEl, {
            opacity: 0
          }, {
            duration: 1
          });

          Velocity(listEl, {
            opacity: 0
          }, {
            duration: 150,
            display: 'inline-block',
            complete: function () {

              this._broadcastStackedView();

              Velocity(stackEl, {
                translateY: 0,
                scale: 1
              }, {
                duration: 200,
                display: 'inline-block',
                complete: function () {
                }.bind(this)
              });

            }.bind(this)
          });
        },

        isExpandingPartially: function () {
          return this.expandingPatially;
        },

        isExpandingFully: function () {
          return this.expandingFully;
        },

        isExpanded: function () {
          return scope.stack.isExpandedView();
        },

        _broadcastStackedView: function () {
          scope.$broadcast('stack:stackedView');
        },

        _broadcastExpandedView: function () {
          scope.$broadcast('stack:expandedView');
        },

        _broadcastExpandingViewPartially: function () {
          scope.$broadcast('stack:expandingViewPartially');
        }
      }, scope.stack.view);


      /* Initialize */

      scope.stack.view.initialize();
    }
  }
}]);
