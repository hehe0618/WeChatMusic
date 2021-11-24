export default function debounce(
  func,
  awit,
  immediate = false,
  resultCallback
) {
  let timer = null;
  let isInvoke = false;
  const _debounce = function (...args) {
    if (timer) clearTimeout(timer);

    if (immediate && !isInvoke) {
      // 立即执行
      const result = func.apply(this, args);
      if (resultCallback) resultCallback(result);
      isInvoke = true;
    } else {
      // 非立即执行
      timer = setTimeout(() => {
        const result = func.apply(this, args);
        if (resultCallback) resultCallback(result);
        isInvoke = false;
      }, awit);
      // 下一次立即执行
    }
  };
  // 定时器清除cancel
  _debounce.cancel = () => {
    clearTimeout(timer);
  };
  return _debounce;
}
