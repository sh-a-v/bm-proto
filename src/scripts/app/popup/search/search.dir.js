app.popup.search.directive('search', function () {
  return {
    restrict: 'E',
    controller: 'SearchCtrl',
    link: function (scope, el, attrs) {
      scope.search.view = {
        inputEl: document.getElementById('search-input'),

        focus: function () {
          this.inputEl.focus();
        }
      };

    }
  };
});
