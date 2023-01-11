import "../styles/styles.scss";
import { debounce } from "./utils.js";

function Slider(options) {
  "use strict";
  if (!options?.root) {
    return;
  }
  options = options || {}
  let root = options.root;
  let activeSlide = options.startSlide || 0;
  let controlsEnabled = options.controls === undefined ? true : options.controls;
  let paginationEnabled = options.pagination === undefined ? true : options.pagination;
  let loop = options.loop;
  let autoplay = options.autoplay;
  let speed = options.speed || 200;
  let delay = options.delay || 1000;
  let loopInterval = null;

  let slides = root.querySelectorAll(".slider__slide");
  let buttons = {
    root: root.querySelector(".slider__buttons"),
    prev: root.querySelector(".slider__button--prev"),
    next: root.querySelector(".slider__button--next"),
  };
  let pagination = {
    root: root.querySelector(".slider__pagination"),
    items: [],
  };
  
  const gotoDebounced = debounce(goto, speed);
  
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
    gotoDebounced(activeSlide);
    setTimeout(() => {
      // slides.forEach((slide) => {
      //   transitionSpeed(slide, speed);
      // });
      // pagination.items.forEach((bullet) => {
      //   transitionSpeed(bullet, speed);
      // });
      document.body.style.setProperty("--slider-transition-duration", `${speed}ms`);
      startLoop();
    }, 0);
  }

  function translate(el, dist) {
    const style = el && el.style;

    if (!style) return;

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform =
    style.MozTransform =
    style.OTransform = 'translateX(' + dist + 'px)';
  }

  function transitionSpeed(el, speed) {
    const style = el && el.style;

    if (!style) return;

    style.webkitTransitionDuration =
    style.MozTransitionDuration =
    style.msTransitionDuration =
    style.OTransitionDuration =
    style.transitionDuration = `${speed}ms`;
  }

  function createPaginationItems() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < slides.length; i++) {
      const bullet = document.createElement("div");
      bullet.innerHTML = `
        <li class="slider__pagination-item">
          <button class="slider__pagination-button" aria-label="Go to slide ${i + 1}">
            Dot slide
          </button>
        </li>
      `;
      fragment.append(bullet.children[0]);
    }
    pagination.root.append(...fragment.children);
    pagination.items.push(...pagination.root.children);
    // pagination.innerOffset = pagination.root.offsetWidth;
  }

  function handlePaginationItems() {
    const step = pagination.root.offsetWidth / 5;
    const offset = (step * 2 - step * activeSlide);
    pagination.items.forEach((bullet) => {
      bullet.removeAttribute("data-offset");
    });
    for (let i = activeSlide; i <= activeSlide + 4; i++) {
      let n = handleIndex(i - 2);
      pagination.items.at(n)?.setAttribute("data-offset", n - activeSlide + 2);
    }
    pagination.items.forEach((bullet) => {
      translate(bullet, offset, speed);
    });
  }

  function handleSliderItems() {
    const width = root.offsetWidth;
    slides.forEach((slide, index) => {
      const offset = -width * index;
      slide.classList.remove("slider__slide--active");
      // index === handleIndex(activeSlide - 1) && slide.classList.add("slider__slide--prev");
      // index === handleIndex(activeSlide + 1) && slide.classList.add("slider__slide--next");
      // index === activeSlide && (
      index === activeSlide && slide.classList.add("slider__slide--active"),
        // slide.classList.remove("slider__slide--prev", "slider__slide--next")
      // );
      translate(slide, offset);
    });
  }

  function handleButtons() {
    if (loop) {
      return;
    }

    activeSlide === 0 ? hide(buttons.prev) : show(buttons.prev);
    activeSlide === slides.length - 1 ? hide(buttons.next) : show(buttons.next);
  }

  function handleIndex(slideIndex) {
    if (loop) {
      return (slides.length + (slideIndex % slides.length)) % slides.length;
    } else {
      return Math.min(slides.length - 1, Math.max(slideIndex, 0));
    }
  }

  function hide(el) {
    el.classList.add("hidden");
  }

  function show(el) {
    el.classList.remove("hidden");
  }

  function next() {
    gotoDebounced(activeSlide + 1);
  }

  function prev() {
    gotoDebounced(activeSlide - 1);
  }

  function goto(slideIndex) {
    activeSlide = handleIndex(slideIndex);
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
    next,
    prev,
    start() {
      startLoop();
    },
    stop,
    activeSlide() {
      return activeSlide;
    },
    goto(slideIndex) {
      goto(slideIndex);
    },
  }
}

const slider = Slider({
  root: document.querySelector("#slider"),
  // autoplay: true,
  // loop: true,
  delay: 1500,
  speed: 200,
  // startSlide: 0,
  // controls: false,
  // pagination: false,
});

window.slider = slider;