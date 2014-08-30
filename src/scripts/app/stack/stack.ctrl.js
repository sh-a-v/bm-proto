app.stack
  .controller('StackCtrl', ['$rootScope', '$scope', '$state', 'UserBookListReadNowResource', function ($rootScope, $scope, $state, UserBookListReadNowResource) {
    $scope.stack = {
      distance: 0,
      currentBook: null,
      animatedBook: null,
      firstBookShowed: true,

      initialize: function () {
        this.setEventListeners();
        this.fetchUserBookListReadNow();
      },

      setEventListeners: function () {
        $scope.$on('stack:nextBookShown', this.setDefaultStateAfterNextBookShown.bind(this));
        $scope.$on('stack:previousBookShown', this.setDefaultStateAfterPreviousBookShown.bind(this));

        $scope.$on('stack:nextBookHidden', this.setDefaultStateAfterNextBookHidden.bind(this));
        $scope.$on('stack:previousBookHidden', this.setDefaultStateAfterPreviousBookHidden.bind(this));
      },

      setUserBookListReadNow: function (res) {
        this.userBookListReadNow = res;

        this.currentBookList = this.userBookListReadNow;
        this.setCurrentBook();
        this.setAnimatedBook(this.currentBook);
      },

      setCurrentBook: function (book) {
        this.currentBook = book || this.currentBookList[0];
        this._setNextBook();
        this._setPreviousBook();
      },

      setAnimatedBook: function (book) {
        this.animatedBook = book || this.currentBook;
      },

      _setNextBook: function () {
        var nextIndex = this.currentBookList.indexOf(this.currentBook) + 1;
        this.nextBook = nextIndex <= this.currentBookList.length - 1 ? this.currentBookList[nextIndex] : null;
      },

      _setPreviousBook: function () {
        var previousIndex = this.currentBookList.indexOf(this.currentBook) - 1;
        this.previousBook = previousIndex >= 0 ? this.currentBookList[previousIndex] : null;
      },

      setDefaultStateAfterNextBookShown: function () {
        this.setAnimatedBook(this.currentBook);
        this.cleanDistance();

        this._setDefaultValues();
      },

      setDefaultStateAfterNextBookHidden: function () {
        this.setCurrentBook(this.animatedBook);
        this.cleanDistance();

        this._setDefaultValues();
      },

      setDefaultStateAfterPreviousBookShown: function () {
        this.setCurrentBook(this.animatedBook);
        this.setAnimatedBook(this.currentBook);
        this.cleanDistance();

        this._setDefaultValues();

        $scope.$apply();
      },

      setDefaultStateAfterPreviousBookHidden: function () {
        this.setAnimatedBook(this.currentBook);
        this.cleanDistance();

        this._setDefaultValues();
      },

      _setDefaultValues: function () {
        this.bookShowingPartially = false;
        this.bookShowingFully = false;
        this.firstBookShowed = false;
        this.lastBookShowed = !this.nextBook;
        this.firstBookShowed = !this.previousBook;
      },

      fetchUserBookListReadNow: function () {
        UserBookListReadNowResource
          .query().$promise
          .then(this.setUserBookListReadNow.bind(this));
      },

      getNextBookFully: function ($event) {
        this.bookShowingFully = true;

        if (!this.isBookShowingPartially()) {
          if (!this.nextBook) {
            return;
          }

          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookFully($event);
      },

      getPreviousBookFully: function ($event) {
        this.bookShowingFully = true;

        if (!this.isBookShowingPartially()) {
          if (!this.previousBook) {
            return;
          }

          this.setAnimatedBook(this.previousBook);
        }

        this._broadcastShowPreviousBookFully($event);
      },

      getBookPartially: function ($event) {
        if (this.isBookShowingFully()) {
          this.cleanDistance();
          return;
        }

        this.distance = this.distance ? this.distance + $event.deltaX : $event.deltaX;

        if (this.distance < 0) {
          this.getNextBookPartially($event);
        } else if (this.distance > 0) {
          this.getPreviousBookPartially($event);
        }
      },

      getNextBookPartially: function ($event) {
        if (!this.nextBook && this.isLastBookShowed()) {
          this.cleanDistance();
          return;
        }

        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookPartially($event);
        console.log('getNextBookPartially');
      },

      getPreviousBookPartially: function ($event) {
        console.log('1', !this.previousBook);
        console.log('2', this.isFirstBookShowed());

        if (!this.previousBook && this.isFirstBookShowed()) {
          this.cleanDistance();
          return;
        }
        console.log('getPreviousBookPartially');
        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setAnimatedBook(this.previousBook);
        }

        this._broadcastShowPreviousBookPartially($event);

      },

      endGetBookPartially: function ($event) {
        if (!this.isBookShowingPartially()) {
          return;
        }

        this._broadcastEndShowBookPartially($event, this.distance);
      },

      cleanDistance: function () {
        this.distance = 0;
      },

      isBookShowingFully: function () {
        return this.bookShowingFully;
      },

      isLastBookShowed: function () {
        return this.lastBookShowed;
      },

      isFirstBookShowed: function () {
        return this.firstBookShowed;
      },

      isBookShowingPartially: function () {
        return this.bookShowingPartially;
      },

      _broadcastShowNextBookFully: function ($event) {
        $scope.$broadcast('stack:showNextBookFully', $event);
      },

      _broadcastShowNextBookPartially: function ($event) {
        $scope.$broadcast('stack:showNextBookPartially', $event);
      },

      _broadcastShowPreviousBookFully: function ($event) {
        $scope.$broadcast('stack:showPreviousBookFully', $event);
      },

      _broadcastShowPreviousBookPartially: function ($event) {
        $scope.$broadcast('stack:showPreviousBookPartially', $event);
      },

      _broadcastEndShowBookPartially: function ($event, distance) {
        $scope.$broadcast('stack:endShowBookPartially', $event, distance);
      }
    };

    $scope.stack.initialize();
  }]);
