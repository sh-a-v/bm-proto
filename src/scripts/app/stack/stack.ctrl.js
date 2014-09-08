app.stack.controller('StackCtrl', [
  '$rootScope', '$scope', '$state', '$timeout', 'UserBookListReadNowResource', 'UserBookListReadWantResource', 'UserBookListAllResource', 'UserMarkersResource', 'CatalogNewResource', 'CatalogBestResource', 'CatalogPopularResource', 'CatalogFriendsResource', 'CatalogShelvesResource',
  function ($rootScope, $scope, $state, $timeout, UserBookListReadNowResource, UserBookListReadWantResource, UserBookListAllResource, UserMarkersResource, CatalogNewResource, CatalogBestResource, CatalogPopularResource, CatalogFriendsResource, CatalogShelvesResource) {
    $scope.stack = {
      expandedView: false,
      expandingView: false,

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
        'CatalogFriendsResource': CatalogFriendsResource,
        'CatalogShelvesResource': CatalogShelvesResource
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

        $scope.$on('stack:stackedView', this.setStackedView.bind(this));
        $scope.$on('stack:expandedView', this.setExpandedView.bind(this));
        $scope.$on('stack:expandingViewPartially', this.setExpandingView.bind(this));
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

      setStackElement: function (id) {
        this.setCurrentItem(this.getItemById(id));
        this.setAnimatedItem(this.getItemById(id));

        this._broadcastStackedViewFromExpanded();
      },

      setExpandingView: function () {
        this.expandingView = true;
      },

      setExpandedView: function () {
        this.expandedView = !this.expandedView;
        this.expandingView = false;

        $scope.$apply();
      },

      setStackedView: function (id) {
        this.expandedView = false;

        $scope.$apply();
      },

      _handleRes: function (res) {
        if (angular.isObject(res) && res.objects) {
          res = res.objects;
        }

        if ($state.$current.resource === 'UserMarkersResource') {
          res = [];
        }

        if ($state.$current.resource === 'CatalogFriendsResource') {
          res = this.friendsList;
        }
        if ($state.$current.resource === 'UserMarkersResource') {
          res = this.quotesList;
        }
        if ($state.$current.resource === 'CatalogShelvesResource') {
          res = this.shelvesList;
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

      getItemById: function (id) {
        return _.find(this.currentItemList, {uuid: id});
      },

      getNextItemFully: function ($event) {
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

        if (this.isExpandingView()) {
          return;
        }

        this.previousDistance = this.distance || 0;
        this.distance = $event.deltaX;

        if (this.previousDistance < 0 && this.distance >= 0) {
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

      isExpandedView: function () {
        return this.expandedView;
      },

      isExpandingView: function () {
        return this.expandingView;
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
      },

      _broadcastStackedViewFromExpanded: function () {
        $scope.$broadcast('stack:stackedViewFromExpanded');
      },

      _broadcastToggleView: function () {
        $scope.$broadcast('stack:toggleView');
      },

      friendsList: [{
        user: {
          photo: '/src/images/photo1.png',
          name: 'Alex Gusev'
        },
        time: 'yesterday',
        type: 'quote',
        doing: 'highlights',
        text: "I'm scared of the geese. When I was five, my mom took me down there to feed those horrible beasts and one of them nearly took my hand off",
        book: {
          title: 'The Summer I Became a Nerd',
          authors: 'Leah Rae Miller',
          cover: '/src/images/small-cover.png'
        }
      }, {
        user: {
          photo: '/src/images/photo1.png',
          name: 'Alex Gusev'
        },
        time: 'yesterday',
        type: 'book',
        doing: 'wants to read',
        book: {
          title: 'Translation Nation',
          authors: 'Hector Tobar',
          cover: '/src/images/big-cover.png'
        }
      }],

      quotesList: [{
        text: "I'm scared of the geese. When I was five, my mom took me down there to feed those horrible beasts and one of them nearly took my hand off",
        book: {
          title: 'The Summer I Became a Nerd',
          authors: 'Leah Rae Miller',
          cover: '/src/images/small-cover.png'
        }
      }],

      shelvesList: [{
        user: {
          photo: '/src/images/photo2.png',
          name: 'NYtimes'
        },
        bg: '/src/images/shelf1.png',
        time: 'yesterday',
        title: 'Travel in Foreign Lands',
        description: 'A collection of books about planes, trains, automobiles and getting lost in a foreign lan',
        count: '156'
      }]
    };

    $scope.stack.initialize();
  }]);
