import "../styles/styles.scss";
import { debounce } from "./utils.js";

export default function Slider(options) {
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
  const handleResizeDebounced = debounce(handleResize, 100);
  
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
      document.body.style.setProperty("--slider-transition-duration", `${speed}ms`);
      startLoop();
    }, 0);

    bind();
  }

  function bind() {
    root.addEventListener("click", handleClicks);
    root.addEventListener("transitionend", handleTransitionEnd);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResizeDebounced);
  }

  function translate(el, dist) {
    const style = el && el.style;

    if (!style) return;

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform =
    style.MozTransform =
    style.OTransform = 'translateX(' + dist + 'px)';
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
      slide.classList.remove("slider__slide--active");
      index === activeSlide && slide.classList.add("slider__slide--active"),

      translate(slide, -width * index);
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

  function handleClicks(event) {
    if (event.target.closest(".slider__buttons") ) {
      handleControlButtonClick(event);
    }
    if (event.target.closest(".slider__pagination") ) {
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
    const item = event.target.closest(".slider__pagination-item") || event.target;
    const index = pagination.items.indexOf(item);
    if (index >= 0) {
      goto(index);
    }
  }

  function handleKeydown(event) {
    if (event.key === "ArrowRight") {
      next();
    } else if(event.key === "ArrowLeft") {
      prev();
    }
  }

  function handleResize() {
    handleSliderItems();
    handlePaginationItems();
  }

  function handleTransitionEnd(event) {
    if (event.target.classList.contains("slider__pagination-item")) {
      startLoop();
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
    stopLoop();
  }

  function startLoop() {
    if (!autoplay || delay <= 0) {
      return;
    }
    stopLoop();
    loopInterval = setInterval(next, delay);
  }

  function stopLoop() {
    clearInterval(loopInterval);
  }

  setup();

  return {
    next,
    prev,
    start() {
      startLoop();
    },
    stop() {
      stopLoop();
    },
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
  loop: true,
  delay: 1500,
  speed: 200,
  // startSlide: 0,
  // controls: false,
  // pagination: false,
});