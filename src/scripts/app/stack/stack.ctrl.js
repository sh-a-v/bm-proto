app.stack
  .controller('StackCtrl', ['$rootScope', '$scope', '$state', 'UserBookListReadNowResource', function ($rootScope, $scope, $state, UserBookListReadNowResource) {
    $scope.stack = {
      distance: 0,
      currentBook: null,
      animatedBook: null,

      initialize: function () {
        this.setEventListeners();
        this.fetchUserBookListReadNow();
      },

      setEventListeners: function () {
        $scope.$on('stack:nextBookShown', this.setDefaultStateAfterNextBookShown.bind(this));
        $scope.$on('stack:previousBookShown', this.setDefaultStateAfterPreviousBookShown.bind(this));
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

        this.bookShowingPartially = false;
        this.bookShowingFully = false;
        this.firstBookShowed = false;
        this.distance = 0;

        if (!this.nextBook) {
          this.lastBookShowed = true;
        }
      },

      setDefaultStateAfterPreviousBookShown: function () {
        this.setCurrentBook(this.animatedBook);

        this.bookShowingPartially = false;
        this.bookShowingFully = false;
        this.lastBookShowed = false;
        this.distance = 0;

        if (!this.previousBook) {
          this.firstBookShowed = true;
        }
      },

      setCurrentBookToAnimatedBook: function () {
        this.setCurrentBook(this.animatedBook);
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

          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowPreviousBookFully($event);
      },

      getBookPartially: function ($event) {
        if (this.isBookShowingFully()) {
          return;
        }

        this.distance = this.distance ? this.distance + $event.clientX : $event.clientX;

        this.distance <= 0 ? this.getNextBookPartially($event) : this.getPreviousBookPartially($event);
      },

      getNextBookPartially: function ($event) {
        if (!this.nextBook && this.isLastBookShowed()) {
          return;
        }

        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookPartially($event);
      },

      getPreviousBookPartially: function ($event) {
        if (!this.previousBook && this.isFirstBookShowed()) {
          return;
        }

        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookPartially($event);
      },

      endGetBookPartially: function ($event) {
        this._broadcastEndShowBookPartially($event);
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

      _broadcastShowNextBook: function ($event) {
        $scope.$broadcast('stack:showNextBook', $event);
      },

      _broadcastShowPreviousBookFully: function ($event) {
        $scope.$broadcast('stack:showPreviousBookFully');
      },

      _broadcastEndShowBookPartially: function ($event) {
        $scope.$broadcast('stack:endShowNextBookPartially');
      }
    };

    $scope.stack.initialize();
  }]);
