var hmTouchEvents = angular.module('hmTouchEvents', []);

var hmGestures = [
  'hmPan:pan',
  'hmPanStart:panstart',
  'hmPanMove:panmove',
  'hmPanEnd:panend',
  'hmPanCancel:pancancel',
  'hmPanLeft:panleft',
  'hmPanRight:panright',
  'hmPanUp:panup',
  'hmPanDown:pandown',

  'hmSwipe:swipe',
  'hmSwipeLeft:swipeleft',
  'hmSwipeRight:swiperight',
  'hmSwipeUp:swipeup',
  'hmSwipeDown:swipedown'
];

angular.forEach(hmGestures, function (name) {

  var
    directive = name.split(':'),
    directiveName = directive[0],
    eventName = directive[1];

  hmTouchEvents.directive(directiveName, ['$parse', function ($parse) {
    return {
      scope: true,
      link: function(scope, element, attr) {
        var fn, opts;

        fn = $parse(attr[directiveName]);
        opts = $parse(attr['hmOptions'])(scope, {});

        if(opts && opts.group) {
          scope.hammer = scope.hammer || Hammer(element[0], opts);
        } else {
          scope.hammer = Hammer(element[0], opts);
        }

        return scope.hammer.on(eventName, function(event) {
          return scope.$apply(function() {
            return fn(scope, {
              $event: event
            });
          });
        });

      }
    };
  }
  ]);
});
