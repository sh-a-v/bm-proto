app.stack
  .controller('StackCtrl', ['$rootScope', '$scope', '$state', 'UserBookListReadNowResource', function ($rootScope, $scope, $state, UserBookListReadNowResource) {
    $scope.stack = {
      currentBook: null,
      animatedBook: null,

      initialize: function () {
        this.setEventListeners();
        this.fetchUserBookListReadNow();
      },

      setEventListeners: function () {
        $scope.$on('stack:nextBookShown', this.setAnimatedBookDefaultState.bind(this));
        $scope.$on('stack:previousBookShown', this.setCurrentBookToAnimatedBook.bind(this));
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

      setAnimatedBookDefaultState: function () {
        this.setAnimatedBook(this.currentBook);
        this.bookShowingPartially = false;
        this.bookShowingFull = false;
        if (!this.nextBook) {
          this.lastBookShowed = true;
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

      getNextBookFull: function ($event) {
        this.bookShowingFull = true;

        if (!this.isBookShowingPartially()) {
          if (!this.nextBook) {
            return;
          }

          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookFull($event);
      },

      getNextBookPartially: function ($event) {
        if (this.isBookShowingFull()) {
          return;
        }

        if (!this.nextBook && this.isLastBookShowed()) {
          //alert(this.nextBook);
          return;
        }

        if (!this.isBookShowingPartially()) {
          this.bookShowingPartially = true;
          this.setCurrentBook(this.nextBook);
        }

        this._broadcastShowNextBookPartially($event);
        //console.log('event partially');
      },

      getNextBook: function ($event) {
        var nextIndex = this.currentBookList.indexOf(this.currentBook) + 1;

        if (nextIndex > this.currentBookList.length - 1) {
          return;
        }

        this.currentBook = this.currentBookList[nextIndex];

        this._broadcastShowNextBook($event);
      },

      getPreviousBook: function () {
        var previousIndex = this.currentBookList.indexOf(this.currentBook) - 1;

        if (previousIndex < 0) {
          return;
        }

        this.animatedBook = this.currentBookList[previousIndex];

        this._broadcastShowPreviousBook();
      },

      endGetBookPartially: function ($event) {
        this._broadcastEndShowBookPartially($event);
      },

      testHammer: function ($event) {
        console.log($event);
      },

      isBookShowingFull: function () {
        return this.bookShowingFull;
      },

      isLastBookShowed: function () {
        return this.lastBookShowed;
      },

      isBookShowingPartially: function () {
        return this.bookShowingPartially;
      },

      _broadcastShowNextBookFull: function ($event) {
        $scope.$broadcast('stack:showNextBookFull', $event);
      },

      _broadcastShowNextBookPartially: function ($event) {
        $scope.$broadcast('stack:showNextBookPartially', $event);
      },

      _broadcastShowNextBook: function ($event) {
        $scope.$broadcast('stack:showNextBook', $event);
      },

      _broadcastShowPreviousBook: function () {
        $scope.$broadcast('stack:showPreviousBook');
      },

      _broadcastEndShowBookPartially: function ($event) {
        $scope.$broadcast('stack:endShowNextBookPartially');
      }
    };

    $scope.stack.initialize();
  }]);
