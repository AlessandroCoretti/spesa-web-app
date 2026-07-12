export function detectPlatform() {
  const ua = navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua) && !window.MSStream
  const isFirefox = /firefox/i.test(ua)
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)
  const isMacSafari = isSafari && !isIos

  return { isIos, isFirefox, isMacSafari }
}
