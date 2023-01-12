"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function debounce(fn, delay) {
  var prevent = false;
  return function () {
    if (prevent) {
      return;
    }
    fn.apply(this, arguments);
    prevent = true;
    setTimeout(function () {
      return prevent = false;
    }, delay);
  };
}
function Slider(options) {
  "use strict";

  var _options;
  if (!((_options = options) !== null && _options !== void 0 && _options.root)) {
    return;
  }
  options = options || {};
  var root = options.root;
  var _activeSlide = options.startSlide || 0;
  var controlsEnabled = options.controls === undefined ? true : options.controls;
  var paginationEnabled = options.pagination === undefined ? true : options.pagination;
  var loop = options.loop;
  var autoplay = options.autoplay;
  var speed = options.speed || 200;
  var delay = options.delay || 1000;
  var loopInterval = null;
  var slides = root.querySelectorAll(".slider__slide");
  var buttons = {
    root: root.querySelector(".slider__buttons"),
    prev: root.querySelector(".slider__button--prev"),
    next: root.querySelector(".slider__button--next")
  };
  var pagination = {
    root: root.querySelector(".slider__pagination"),
    items: []
  };
  var gotoDebounced = debounce(_goto, speed);
  var handleResizeDebounced = debounce(handleResize, 200);
  function setup() {
    if (!controlsEnabled || slides.length < 2) {
      hide(buttons.root);
    } else {
      show(buttons.root);
    }
    if (!paginationEnabled || slides.length < 2) {
      hide(pagination.root);
    } else {
      show(pagination.root);
      createPaginationItems();
    }
    gotoDebounced(_activeSlide);
    setTimeout(function () {
      // slides.forEach((slide) => {
      //   transitionSpeed(slide, speed);
      // });
      // pagination.items.forEach((bullet) => {
      //   transitionSpeed(bullet, speed);
      // });
      document.body.style.setProperty("--slider-transition-duration", "".concat(speed, "ms"));
      startLoop();
    }, 0);
    bind();
  }
  function bind() {
    root.addEventListener("click", handleClicks);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResizeDebounced);
  }
  function translate(el, dist) {
    var style = el && el.style;
    if (!style) return;
    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + dist + 'px)';
  }
  function createPaginationItems() {
    var _pagination$root, _pagination$items;
    var fragment = document.createElement("div");
    for (var i = 0; i < slides.length; i++) {
      var bullet = document.createElement("div");
      bullet.innerHTML = "\n        <li class=\"slider__pagination-item\">\n          <button class=\"slider__pagination-button\" aria-label=\"Go to slide ".concat(i + 1, "\">\n            Dot slide\n          </button>\n        </li>\n      ");
      fragment.appendChild(bullet.children[0]);
    }
    (_pagination$root = pagination.root).appendChild.apply(_pagination$root, _toConsumableArray(fragment.children));
    (_pagination$items = pagination.items).push.apply(_pagination$items, _toConsumableArray(pagination.root.children));
    // pagination.innerOffset = pagination.root.offsetWidth;
  }

  function handlePaginationItems() {
    var step = pagination.root.offsetWidth / 5;
    var offset = step * 2 - step * _activeSlide;
    pagination.items.forEach(function (bullet) {
      bullet.removeAttribute("data-offset");
    });
    for (var i = _activeSlide; i <= _activeSlide + 4; i++) {
      var _pagination$items$at;
      var n = handleIndex(i - 2);
      (_pagination$items$at = pagination.items[n]) === null || _pagination$items$at === void 0 ? void 0 : _pagination$items$at.setAttribute("data-offset", n - _activeSlide + 2);
    }
    pagination.items.forEach(function (bullet) {
      translate(bullet, offset, speed);
    });
  }
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }
  function handleSliderItems() {
    var width = root.offsetWidth;
    
    slides.forEach(function (slide, index) {
      slide.classList.remove("slider__slide--active");
      index === _activeSlide && slide.classList.add("slider__slide--active"), translate(slide, -width * index);
    });
  }
  function handleButtons() {
    if (loop) {
      return;
    }
    _activeSlide === 0 ? hide(buttons.prev) : show(buttons.prev);
    _activeSlide === slides.length - 1 ? hide(buttons.next) : show(buttons.next);
  }
  function handleIndex(slideIndex) {
    if (loop) {
      return (slides.length + slideIndex % slides.length) % slides.length;
    } else {
      return Math.min(slides.length - 1, Math.max(slideIndex, 0));
    }
  }
  function handleClicks(event) {
    if (event.target.closest(".slider__buttons")) {
      handleControlButtonClick(event);
    }
    if (event.target.closest(".slider__pagination")) {
      handlePaginationBulletClick(event);
    }
  }
  function handleControlButtonClick(event) {
    if (event.target.classList.contains("slider__button--next")) {
      next();
    } else if (event.target.classList.contains("slider__button--prev")) {
      prev();
    }
  }
  function handlePaginationBulletClick(event) {
    var item = event.target.closest(".slider__pagination-item") || event.target;
    var index = pagination.items.indexOf(item);
    if (index >= 0) {
      _goto(index);
    }
  }
  function handleKeydown(event) {
    if (event.key === "ArrowRight") {
      next();
    } else if (event.key === "ArrowLeft") {
      prev();
    }
  }
  function handleResize() {
    handleSliderItems();
  }
  function hide(el) {
    el.classList.add("hidden");
  }
  function show(el) {
    el.classList.remove("hidden");
  }
  function next() {
    gotoDebounced(_activeSlide + 1);
  }
  function prev() {
    gotoDebounced(_activeSlide - 1);
  }
  function _goto(slideIndex) {
    _activeSlide = handleIndex(slideIndex);
    handleButtons();
    handleSliderItems();
    handlePaginationItems();
    startLoop();
  }
  function startLoop() {
    if (!autoplay) {
      return;
    }
    stop();
    loopInterval = setInterval(next, delay);
  }
  function stop() {
    clearInterval(loopInterval);
  }
  setup();
  return {
    next: next,
    prev: prev,
    start: function start() {
      startLoop();
    },
    stop: stop,
    activeSlide: function activeSlide() {
      return _activeSlide;
    },
    "goto": function goto(slideIndex) {
      _goto(slideIndex);
    }
  };
}
var slider = Slider({
  root: document.querySelector("#slider"),
  // autoplay: true,
  loop: true,
  delay: 1500,
  speed: 200,
  // startSlide: 0,
  // controls: false,
  pagination: false,
});

// var slider2 = Slider({
//   root: document.querySelector("#slider2"),
//   autoplay: true,
//   loop: true,
//   delay: 500,
//   speed: 500,
//   startSlide: 4
//   // controls: false,
//   // pagination: false,
// });

// window.slider2 = slider2;
window.slider = slider;