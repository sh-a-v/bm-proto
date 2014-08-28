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
        $scope.$on('stack:nextBookShown', this.setAnimatedBookToCurrentBook.bind(this));
        $scope.$on('stack:previousBookShown', this.setCurrentBookToAnimatedBook.bind(this));
      },

      setUserBookListReadNow: function (res) {
        console.log(res);
        this.userBookListReadNow = res;

        this.currentBookList = this.userBookListReadNow;
        this.currentBook = this.userBookListReadNow[0];
        this.setAnimatedBookToCurrentBook();
      },

      setAnimatedBookToCurrentBook: function () {
        this.animatedBook = this.currentBook;
      },

      setCurrentBookToAnimatedBook: function () {
        console.log(this.currentBook);
        this.currentBook = this.animatedBook;
        console.log(this.currentBook);
      },

      fetchUserBookListReadNow: function () {
        UserBookListReadNowResource
          .query().$promise
          .then(this.setUserBookListReadNow.bind(this));
      },

      getNextBook: function () {
        var nextIndex = this.currentBookList.indexOf(this.currentBook) + 1;

        if (nextIndex > this.currentBookList.length - 1) {
          return;
        }

        this.currentBook = this.currentBookList[nextIndex];

        this._broadcastShowNextBook();
      },

      getPreviousBook: function () {
        var previousIndex = this.currentBookList.indexOf(this.currentBook) - 1;

        if (previousIndex < 0) {
          return;
        }

        this.animatedBook = this.currentBookList[previousIndex];

        this._broadcastShowPreviousBook();
      },

      _broadcastShowNextBook: function () {
        $scope.$broadcast('stack:showNextBook');
      },

      _broadcastShowPreviousBook: function () {
        $scope.$broadcast('stack:showPreviousBook');
      }
    };

    $scope.stack.initialize();
  }]);
