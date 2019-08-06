import img1 from './images/crop-1.jpg'
import img2 from './images/crop-2.jpg'
import img3 from './images/crop-3.jpg'
import img4 from './images/crop-4.jpg'
import img5 from './images/crop-5.jpg'
import img6 from './images/crop-6.jpg'
import img7 from './images/crop-7.jpg'
import img8 from './images/crop-8.jpg'
import img9 from './images/crop-9.jpg'
import img10 from './images/crop-10.jpg'
import img11 from './images/crop-11.jpg'
import img12 from './images/crop-12.jpg'
import img13 from './images/crop-13.jpg'
import img14 from './images/crop-14.jpg'

export default (() => {
  let scale = 0.725
  var isMoble =
    navigator.userAgent
      .toLowerCase()
      .match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null
  if (isMoble) {
    scale = 0.5
  } else {
    scale = 1
  }
  return [
    [img1, 0, -16, 10, 0, scale],
    [img2, 0, -20, 10, 0, scale],
    [img3, 0, -24, 10, 0, scale],
    [img4, 0, -18, 10, 0, scale],
  ]
})()
