import "../styles/styles.scss";
import { debounce } from "./utils.js";
/**
 * 
 * @param {Object} options Параметры
 * @params options.root Родительский элемент слайдера
 * @params options.startSlide Номер слайда, с которого начинается показ
 * @params options.controls Включить кнопки переключения Default true
 * @params options.pagination Включить пагинацию. Default true
 * @params options.loop Включить бесконечный режим переключения
 * @params options.autoplay Автоперелистывание
 * @params options.speed Скорость анимации
 * @params options.delay Задержка перед переключением слайда
 * @params options.thumbnails Включить обложки. Включается вместо пагинации
 * @returns Экземпляр слайдера
 */
export default function Slider(options) {
  "use strict";
  if (!options?.root) {
    return;
  }

  // console.log(options)
  options = options || {}
  let root = options.root;
  let activeSlideIndex = options.startSlide || 0;
  let controlsEnabled = options.controls === undefined ? true : options.controls;
  let thumbnailsEnabled = options.thumbnails || false;
  let paginationEnabled = options.pagination === undefined ? true : options.pagination;
  let loop = options.loop;
  let autoplay = options.autoplay;
  let speed = options.speed || 200;
  let delay = options.delay || 1000;
  let loopInterval = null;

  if (thumbnailsEnabled) {
    paginationEnabled = false;
  }

  let slides = root.querySelectorAll(".slider__slide");
  let buttons = {
    root: root.querySelector(".slider__buttons"),
    prev: root.querySelector(".slider__button--prev"),
    next: root.querySelector(".slider__button--next"),
  };

  let thumbnails = {
    root: root.querySelector(".slider__thumbnails"),
    inner: root.querySelector(".slider__thumbnails-inner"),
    items: [],
  };

  let pagination = {
    root: root.querySelector(".slider__pagination"),
    items: [],
  };

  const emitter = {
    listeners: {},
    on(name, fn) {
      !this.listeners[name] && (this.listeners[name] = []);
      this.listeners[name].push(fn);
    },
    off(name, fn) {
      this.listeners[name] = this.listeners[name].filter((listenerFn) => listenerFn !== fn);
    },
    emit(name) {
      const listeners = this.listeners[name];
      listeners && listeners.forEach((fn) => fn.call(
        null,
        Array.prototype.slice.call(arguments, 1)
      ));
    }
  }
  
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
    if (thumbnailsEnabled) {
      createThumbnails();
    }
    gotoDebounced(activeSlideIndex);
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

  function unbind() {
    root.removeEventListener("click", handleClicks);
    root.removeEventListener("transitionend", handleTransitionEnd);
    document.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", handleResizeDebounced);
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
          <span class="slider__pagination-bullet" aria-label="Go to slide ${i + 1}">
            Dot slide
          </span>
        </li>
      `;
      fragment.append(bullet.children[0]);
    }
    pagination.root.append(...fragment.children);
    pagination.items.push(...pagination.root.children);
  }

  function createThumbnails() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < slides.length; i++) {
      const slideImg = slides[i].querySelector("img");
      const thumbnialLink = slideImg.dataset.thumb;
      const bullet = document.createElement("div");
      bullet.innerHTML = `
        <div class="slider__thumbnails-item">
          <img src="${thumbnialLink}" alt="">
        </div>
      `;
      fragment.append(bullet.children[0]);
    }
    thumbnails.inner.append(...fragment.children);
    thumbnails.items.push(...thumbnails.inner.children);
  }

  function handlePaginationItems() {
    const step = pagination.root.offsetWidth / 5;
    const offset = (step * 2 - step * activeSlideIndex);
    pagination.items.forEach((bullet) => {
      bullet.removeAttribute("data-offset");
    });
    for (let i = activeSlideIndex; i <= activeSlideIndex + 4; i++) {
      let n = handleIndex(i - 2);
      pagination.items[n]?.setAttribute("data-offset", n - activeSlideIndex + 2);
    }
    pagination.items.forEach((bullet) => {
      translate(bullet, offset, speed);
    });
  }

  function handleSliderItems() {
    // const widthOuter = root.offsetWidth;
    const width = root.querySelector('.slider__slides').offsetWidth;
    console.log(width);
    slides.forEach((slide, index) => {
      slide.classList.remove("slider__slide--active");
      index === activeSlideIndex && slide.classList.add("slider__slide--active"),

      translate(slide, -width * index);
    });
  }

  function handleThumbnailsItems() {
    const widthOuter = thumbnails.root.offsetWidth;
    const widthInner = thumbnails.inner.offsetWidth;
    const step = (widthInner - widthOuter) / (thumbnails.items.length - 1);
    let offset = -step * activeSlideIndex;
    thumbnails.items.forEach((thumb) => {
      translate(thumb, offset, speed);
    });
  }

  function handleButtons() {
    if (loop) {
      return;
    }

    activeSlideIndex === 0 ? hide(buttons.prev) : show(buttons.prev);
    activeSlideIndex === slides.length - 1 ? hide(buttons.next) : show(buttons.next);
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
    if (event.target.closest(".slider__thumbnails") ) {
      handleThumbnailsClick(event);
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

  function handleThumbnailsClick(event) {
    const item = event.target.closest(".slider__thumbnails-item") || event.target;
    const index = thumbnails.items.indexOf(item);
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
    handleThumbnailsItems();
  }

  function handleLazyLoading() {
    const slide = slides[activeSlideIndex];
    const img = slide.querySelector("img");
    img.src = img.dataset.src;
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
    gotoDebounced(activeSlideIndex + 1);
  }

  function prev() {
    gotoDebounced(activeSlideIndex - 1);
  }

  function goto(slideIndex) {
    activeSlideIndex = handleIndex(slideIndex);
    handleButtons();
    handleSliderItems();
    handleLazyLoading();
    handlePaginationItems();
    handleThumbnailsItems();
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
      return activeSlideIndex;
    },
    goto(slideIndex) {
      goto(slideIndex);
    },
    destroy() {
      unbind();
      root.remove();
      emitter.emit("destroy");

    },
    on(name, fn) {
      emitter.on(name, fn);
    },
    root
  }
}

const slider = Slider({
  root: document.querySelector("#slider"),
  // autoplay: true,
  loop: true,
  delay: 1500,
  speed: 200,
  thumbnails: true,
  pagination: false,
  // startSlide: 0,
  // controls: false,
  // pagination: false,
});