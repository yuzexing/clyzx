import * as THREE from 'three'
import React, { useState, useRef, useContext, useEffect, useCallback, useMemo } from 'react'
import { apply as applySpring, useSpring, a, interpolate } from 'react-spring/three'
import { apply as applyThree, Canvas, useRender, useThree } from 'react-three-fiber'
import data from './../resources/data'
import message from './../resources/message'

// Import and register postprocessing classes as three-native-elements
import { EffectComposer } from './../resources/postprocessing/EffectComposer'
import { RenderPass } from './../resources/postprocessing/RenderPass'
import { GlitchPass } from './../resources/postprocessing/GlitchPass'

applySpring({ EffectComposer, RenderPass, GlitchPass })
applyThree({ EffectComposer, RenderPass, GlitchPass })

// delay 手机端适配

/** This component loads an image and projects it onto a plane */
function Image({ url, opacity, scale, ...props }) {
  const texture = useMemo(() => new THREE.TextureLoader().load(url), [url])
  const [hovered, setHover] = useState(false)
  const hover = useCallback(() => setHover(true), [])
  const unhover = useCallback(() => setHover(false), [])
  const { factor } = useSpring({ factor: hovered ? 1.1 : 1 })
  return (
    <a.mesh {...props} onHover={hover} onUnhover={unhover} scale={factor.interpolate(f => [scale * f, scale * f, 1])}>
      <planeBufferGeometry attach="geometry" args={[5, 5]} />
      <a.meshLambertMaterial attach="material" transparent opacity={opacity}>
        <primitive attach="map" object={texture} />
      </a.meshLambertMaterial>
    </a.mesh>
  )
}

/** This renders text via canvas and projects it as a sprite */
function Text({ children, position, opacity, color = 'white', fontSize = 410 }) {
  const {
    camera,
    size: { width, height },
    viewport: { width: viewportWidth, height: viewportHeight },
  } = useThree()
  const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight
  const canvas = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 2048
    const context = canvas.getContext('2d')
    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = color
    context.fillText(children, 1024, 1024 - fontSize / 2)
    return canvas
  }, [children, width, height])
  return (
    <a.sprite scale={[scale, scale, 1]} position={position}>
      <a.spriteMaterial attach="material" transparent opacity={opacity}>
        <canvasTexture attach="map" image={canvas} premultiplyAlpha onUpdate={s => (s.needsUpdate = true)} />
      </a.spriteMaterial>
    </a.sprite>
  )
}

/** This component creates a fullscreen colored plane */
function Background({ color }) {
  const { viewport } = useThree()
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry attach="geometry" args={[1, 1]} />
      <a.meshBasicMaterial attach="material" color={color} depthTest={false} />
    </mesh>
  )
}

/** This component rotates a bunch of stars */
function Stars({ position }) {
  let group = useRef()
  let theta = 0
  useRender(() => {
    const r = 5 * Math.sin(THREE.Math.degToRad((theta += 0.01)))
    const s = Math.cos(THREE.Math.degToRad(theta * 2))
    group.current.rotation.set(r, r, r)
    group.current.scale.set(s, s, s)
  })
  const [geo, mat, coords] = useMemo(() => {
    const geo = new THREE.SphereBufferGeometry(1, 10, 10)
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('peachpuff') })
    const coords = new Array(1000)
      .fill()
      .map(i => [Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400])
    return [geo, mat, coords]
  }, [])
  return (
    <a.group ref={group} position={position}>
      {coords.map(([p1, p2, p3], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[p1, p2, p3]} />
      ))}
    </a.group>
  )
}

/** This component creates a glitch effect */
const Effects = React.memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  // This takes over as the main render-loop (when 2nd arg is set to true)
  useRender(() => composer.current.render(), true)
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" args={[scene, camera]} />
      <a.glitchPass attachArray="passes" renderToScreen factor={factor} />
    </effectComposer>
  )
})

/** This component creates a bunch of parallaxed images */
function Images({ top, mouse, scrollMax }) {
  return data.map(([url, x, y, factor, z, scale], index) => (
    <Image
      key={index}
      url={url}
      scale={scale}
      opacity={top.interpolate([0, 500], [0, 1])}
      position={interpolate([top, mouse], (top, mouse) => [
        (-mouse[0] * factor) / 50000 + x,
        (mouse[1] * factor) / 50000 + y * 1.15 + ((top * factor) / scrollMax) * 2,
        z + top / 2000,
      ])}
    />
  ))
}

/** This component creates a bunch of parallaxed images */
function Messages({ top, mouse, scrollMax }) {
  return message.map(([url, x, y, factor, z, scale], index) => (
    <Image
      key={index}
      url={url}
      scale={scale}
      opacity={interpolate([top, mouse], (top, mouse) => {
        const realY = (mouse[1] * factor) / 50000 + y * 1.15 + ((top * factor) / scrollMax) * 2
        let realZ = z + top / 1000
        let temp = Math.abs(realY)
        realZ = 2 - temp
        realZ = realZ < 0 ? 0 : realZ
        return realZ
      })}
      position={interpolate([top, mouse], (top, mouse) => {
        console.log(top)
        let realY = (mouse[1] * factor) / 50000 + y * 1.15 + ((top * factor) / scrollMax) * 2
        let realZ = z + top / 1000
        let temp = Math.abs(realY)
        realZ = 2 - temp
        realZ = realZ < -2 ? -2 : realZ
        return [0, realY, realZ]
      })}
    />
  ))
}

/** This component maintains the scene */
function Scene({ top, mouse, time }) {
  const { size } = useThree()
  const scrollMax = size.height * 4.5
  return (
    <>
      <a.spotLight intensity={1.2} color="white" position={mouse.interpolate((x, y) => [x / 100, -y / 100, 6.5])} />
      <Effects
        factor={time.interpolate(t => {
          if (t < 2000 || top.value > 200) {
            return 0
          }
          if ((t >= 2000) & (t < 4000)) {
            const temp = t - 2000
            return temp / 1333
          }
          if (t >= 4000 && t < 6000) {
            const temp = t - 4000
            return 1.5 - temp / 1333
          }
          return 0
        })}
      />
      <Background
        color={top.interpolate(
          [0, scrollMax * 0.25, scrollMax * 0.8, scrollMax],
          ['#27282F', '#247BA0', '#70C1B3', '#f8f3f1']
        )}
      />
      <Stars position={top.interpolate(top => [0, -1 + top / 20, 0])} />
      <Images top={top} mouse={mouse} scrollMax={scrollMax} />
      <Messages top={top} mouse={mouse} scrollMax={scrollMax} />
      <Text
        opacity={top.interpolate([0, 200], [1, 0])}
        position={top.interpolate(top => [0, -1 + top / 200, 0])}
        fontSize={200}>
        Test
      </Text>
      <Text
        opacity={time.interpolate(t => {
          if (t < 4000 || top.value > 200) {
            return 0
          }
          if (t >= 4000 && t < 6000) {
            return (t - 4000) / 2000
          }
          if (parseInt((parseInt(t, 10) % 10000) / 1000, 10) % 2 === 0) {
            return 1 - (t % 1000) / 1000
          }
          return (t % 1000) / 1000
        })}
        fontSize={40}
        color="#cfcfcf"
        position={top.interpolate(top => {
          return [3, -3 + top / 200, 0]
        })}>
        向下缓慢滑动
      </Text>
    </>
  )
}

/** Main component */
export default function Main() {
  // This tiny spring right here controlls all(!) the animations, one for scroll, the other for mouse movement ...
  const [{ top, mouse, time }, set] = useSpring(() => ({ top: 0, mouse: [0, 0], time: 0 }))
  const onMouseMove = useCallback(
    ({ clientX: x, clientY: y }) => set({ mouse: [x - window.innerWidth / 2, y - window.innerHeight / 2] }),
    []
  )
  const onScroll = useCallback(e => set({ top: e.target.scrollTop }), [])
  let i = 0
  const TIME_INTERVAL = 100
  setInterval(() => {
    i += TIME_INTERVAL
    set({ time: i })
  }, TIME_INTERVAL)
  return (
    <>
      <Canvas className="canvas">
        <Scene top={top} time={time} mouse={mouse} />
      </Canvas>
      <div className="scroll-container" onScroll={onScroll} onMouseMove={onMouseMove}>
        <div style={{ height: '800vh' }} />
      </div>
    </>
  )
}