app.stack.controller('StackCtrl', [
  '$rootScope', '$scope', '$state', 'UserBookListReadNowResource', 'UserBookListReadWantResource', 'UserBookListAllResource', 'UserMarkersResource', 'CatalogNewResource', 'CatalogBestResource', 'CatalogPopularResource', 'CatalogFriendsResource',
  function ($rootScope, $scope, $state, UserBookListReadNowResource, UserBookListReadWantResource, UserBookListAllResource, UserMarkersResource, CatalogNewResource, CatalogBestResource, CatalogPopularResource, CatalogFriendsResource) {
    $scope.stack = {
      distance: 0,
      currentItem: null,
      animatedItem: null,
      firstItemShowed: true,

      resources: {
        'UserBookListReadNowResource': UserBookListReadNowResource,
        'UserBookListReadWantResource': UserBookListReadWantResource,
        'UserBookListAllResource': UserBookListAllResource,
        'UserMarkersResource': UserMarkersResource,
        'CatalogBestResource': CatalogBestResource,
        'CatalogNewResource': CatalogNewResource,
        'CatalogPopularResource': CatalogPopularResource,
        'CatalogFriendsResource': CatalogFriendsResource
      },

      initialize: function () {
        this.setEventListeners();
        this.fetchUserItemList();
      },

      setEventListeners: function () {
        $scope.$on('stack:nextItemShown', this.setDefaultStateAfterNextItemShown.bind(this));
        $scope.$on('stack:previousItemShown', this.setDefaultStateAfterPreviousItemShown.bind(this));

        $scope.$on('stack:nextItemHidden', this.setDefaultStateAfterNextItemHidden.bind(this));
        $scope.$on('stack:previousItemHidden', this.setDefaultStateAfterPreviousItemHidden.bind(this));
      },

      setUserItemList: function (res) {
        this.currentItemList = this._handleRes(res);

        this.setCurrentItem();
        this.setAnimatedItem(this.currentItem);
      },

      setCurrentItem: function (item) {
        this.currentItem = item || this.currentItemList[0];
        this._setNextItem();
        this._setPreviousItem();
      },

      setAnimatedItem: function (item) {
        this.animatedItem = item || this.currentItem;
      },

      _setNextItem: function () {
        var nextIndex = this.currentItemList.indexOf(this.currentItem) + 1;
        this.nextItem = nextIndex <= this.currentItemList.length - 1 ? this.currentItemList[nextIndex] : null;
      },

      _setPreviousItem: function () {
        var previousIndex = this.currentItemList.indexOf(this.currentItem) - 1;
        this.previousItem = previousIndex >= 0 ? this.currentItemList[previousIndex] : null;
      },

      setDefaultStateAfterNextItemShown: function () {
        this.setAnimatedItem(this.currentItem);
        this.cleanDistance();

        this._setDefaultValues();
      },

      setDefaultStateAfterNextItemHidden: function () {
        this.setCurrentItem(this.animatedItem);
        this.cleanDistance();

        this._setDefaultValues();
      },

      setDefaultStateAfterPreviousItemShown: function () {
        this.setCurrentItem(this.animatedItem);
        this.setAnimatedItem(this.currentItem);
        this.cleanDistance();

        this._setDefaultValues();

        $scope.$apply();
      },

      setDefaultStateAfterPreviousItemHidden: function () {
        this.setAnimatedItem(this.currentItem);
        this.cleanDistance();

        this._setDefaultValues();
      },

      _setDefaultValues: function () {
        this.itemShowingPartially = false;
        this.itemShowingFully = false;
        this.firstItemShowed = false;
        this.lastItemShowed = !this.nextItem;
        this.firstItemShowed = !this.previousItem;
      },

      _handleRes: function (res) {
        if (angular.isObject(res) && res.objects) {
          res = res.objects;
        }

        angular.forEach(res, function (item) {
          item.type = $state.$current.type || '';
        }.bind(this));

        if ($state.$current.resource === 'UserMarkersResource') {
          var markersRes = [];

          angular.forEach(res, function (markers) {
            angular.forEach(markers[0], function (marker) {
              marker.type = 'quote';
              markersRes.push(marker);
            })
          }.bind(this));

          res = markersRes;
        }

        if (res.length === 0 || res.length === 1) {
          this.lastItemShowed = true;
        }

        return res;
      },

      fetchUserItemList: function () {
        this.currentResource = this.resources[$state.$current.resource];

        if (!this.currentResource) {
          return;
        }

        this.currentResource
          .query().$promise
          .then(this.setUserItemList.bind(this));
      },

      getNextItemFully: function ($event) {
        console.log('next fully');
        if (!this.isItemShowingPartially()) {
          if (!this.nextItem) {
            return;
          }

          this.setCurrentItem(this.nextItem);
        }

        this.itemShowingFully = true;

        this._broadcastShowNextItemFully($event);
      },

      getPreviousItemFully: function ($event) {
        if (!this.isItemShowingPartially()) {
          if (!this.previousItem) {
            return;
          }

          this.setAnimatedItem(this.previousItem);
        }

        this.itemShowingFully = true;

        this._broadcastShowPreviousItemFully($event);
      },

      getItemPartially: function ($event) {
        if (this.isItemShowingFully()) {
          this.cleanDistance();
          return;
        }

        this.previousDistance = this.distance || 0;
        this.distance = $event.deltaX;

        if (this.previousDistance < 0 && this.distance > 0) {
          this.distance = -1;
        }

        if (this.distance < 0) {
          this.getNextItemPartially($event);
        } else if (this.distance > 0) {
          this.getPreviousItemPartially($event);
        }
      },

      getNextItemPartially: function ($event) {
        if (!this.nextItem && this.isLastItemShowed()) {
          this.cleanDistance();
          return;
        }

        if (!this.isItemShowingPartially()) {
          this.itemShowingPartially = true;
          this.setCurrentItem(this.nextItem);
        }

        this._broadcastShowNextItemPartially($event);
      },

      getPreviousItemPartially: function ($event) {
        if (!this.previousItem && this.isFirstItemShowed()) {
          this.cleanDistance();
          return;
        }

        if (!this.isItemShowingPartially()) {
          this.itemShowingPartially = true;
          this.setAnimatedItem(this.previousItem);
        }

        this._broadcastShowPreviousItemPartially($event);

      },

      endGetItemPartially: function ($event) {
        if (!this.isItemShowingPartially()) {
          return;
        }

        this._broadcastEndShowItemPartially($event, this.distance);
      },

      cleanDistance: function () {
        this.distance = 0;
      },

      isItemShowingFully: function () {
        return this.itemShowingFully;
      },

      isLastItemShowed: function () {
        return this.lastItemShowed;
      },

      isFirstItemShowed: function () {
        return this.firstItemShowed;
      },

      isItemShowingPartially: function () {
        return this.itemShowingPartially;
      },

      _broadcastShowNextItemFully: function ($event) {
        $scope.$broadcast('stack:showNextItemFully', $event);
      },

      _broadcastShowNextItemPartially: function ($event) {
        $scope.$broadcast('stack:showNextItemPartially', $event);
      },

      _broadcastShowPreviousItemFully: function ($event) {
        $scope.$broadcast('stack:showPreviousItemFully', $event);
      },

      _broadcastShowPreviousItemPartially: function ($event) {
        $scope.$broadcast('stack:showPreviousItemPartially', $event);
      },

      _broadcastEndShowItemPartially: function ($event, distance) {
        $scope.$broadcast('stack:endShowItemPartially', $event, distance);
      }
    };

    $scope.stack.initialize();
  }]);
