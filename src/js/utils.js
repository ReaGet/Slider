export function debounce(fn, delay) {
  let prevent = false;
  return function() {
    if (prevent) {
      return;
    }

    fn.apply(this, arguments);
    prevent = true;
    setTimeout(() => prevent = false, delay);
  }
}