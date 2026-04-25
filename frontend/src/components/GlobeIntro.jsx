import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const GOA_LAT = 15.4989
const GOA_LNG = 73.8278
const EARTH_RADIUS = 1

const TEXTURES = {
  earth: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
  bump: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_bump_2048.jpg',
  specular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
}

function latLngToVector3(lat, lng, radius = EARTH_RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lng + 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
}

function loadTexture(loader, url, renderer) {
  const texture = loader.load(url)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function targetQuaternionForLocation(lat, lng) {
  const location = latLngToVector3(lat, lng).normalize()
  const north = latLngToVector3(lat + 0.1, lng).normalize().sub(location).normalize()
  const faceCamera = new THREE.Quaternion().setFromUnitVectors(
    location,
    new THREE.Vector3(0, 0, 1),
  )
  const northOnScreen = north.applyQuaternion(faceCamera)
  const roll = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    Math.atan2(northOnScreen.x, northOnScreen.y),
  )

  return roll.multiply(faceCamera)
}

export default function GlobeIntro({ onComplete }) {
  const mountRef = useRef(null)
  const completeRef = useRef(onComplete)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x02050c)
    scene.fog = new THREE.FogExp2(0x02050c, 0.018)

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.02,
      1000,
    )
    camera.position.set(0, 0, 4.4)

    scene.add(new THREE.AmbientLight(0x9db8ff, 0.28))

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6)
    sunLight.position.set(4.5, 2.8, 5)
    scene.add(sunLight)

    const rimLight = new THREE.DirectionalLight(0x5ebcff, 1.1)
    rimLight.position.set(-5, 1.5, -3)
    scene.add(rimLight)

    const textureLoader = new THREE.TextureLoader()
    textureLoader.crossOrigin = 'anonymous'

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: loadTexture(textureLoader, TEXTURES.earth, renderer),
      bumpMap: loadTexture(textureLoader, TEXTURES.bump, renderer),
      bumpScale: 0.035,
      specularMap: loadTexture(textureLoader, TEXTURES.specular, renderer),
      specular: new THREE.Color(0x24445f),
      shininess: 18,
    })

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 192, 96),
      earthMaterial,
    )
    scene.add(globe)

    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: loadTexture(textureLoader, TEXTURES.clouds, renderer),
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    })
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 192, 96),
      cloudMaterial,
    )
    globe.add(clouds)

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.045, 128, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4fb7ff,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    )
    scene.add(atmosphere)

    const goaVector = latLngToVector3(GOA_LAT, GOA_LNG, EARTH_RADIUS)
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 24, 12),
      new THREE.MeshBasicMaterial({ color: 0x7df9ff }),
    )
    marker.position.copy(goaVector.clone().multiplyScalar(1.018))
    globe.add(marker)

    const markerGlow = new THREE.PointLight(0x7df9ff, 1.8, 0.45)
    markerGlow.position.copy(goaVector.clone().multiplyScalar(1.04))
    globe.add(markerGlow)

    const starGeo = new THREE.BufferGeometry()
    const starVerts = []
    for (let i = 0; i < 10000; i += 1) {
      const distance = THREE.MathUtils.randFloat(70, 240)
      const direction = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(1),
        THREE.MathUtils.randFloatSpread(1),
        THREE.MathUtils.randFloatSpread(1),
      ).normalize()
      starVerts.push(
        direction.x * distance,
        direction.y * distance,
        direction.z * distance,
      )
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3))
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xd9efff,
        size: 0.11,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.86,
      }),
    )
    scene.add(stars)

    const SPIN_DURATION = 2.1
    const ALIGN_DURATION = 1.7
    const ZOOM_DURATION = 2.2
    const FINAL_CAMERA_Z = 1.42

    let phase = 'spin'
    let spinTime = 0
    let alignProgress = 0
    let zoomProgress = 0
    let frameId = 0
    let completed = false

    let lastFrameTime = performance.now()
    const startQuaternion = new THREE.Quaternion()
    const targetQuaternion = targetQuaternionForLocation(GOA_LAT, GOA_LNG)

    function finishIntro() {
      if (completed) return
      completed = true
      window.setTimeout(() => completeRef.current?.(), 260)
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function animate() {
      const now = performance.now()
      const delta = Math.min((now - lastFrameTime) / 1000, 0.04)
      lastFrameTime = now
      frameId = window.requestAnimationFrame(animate)

      stars.rotation.y += delta * 0.012
      clouds.rotation.y += delta * 0.025

      if (phase === 'spin') {
        globe.rotation.y += delta * 0.95
        globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, -0.08, 0.02)
        spinTime += delta

        if (spinTime >= SPIN_DURATION) {
          phase = 'align'
          startQuaternion.copy(globe.quaternion)
        }
      } else if (phase === 'align') {
        alignProgress = Math.min(alignProgress + delta / ALIGN_DURATION, 1)
        globe.quaternion.slerpQuaternions(
          startQuaternion,
          targetQuaternion,
          easeInOut(alignProgress),
        )

        if (alignProgress >= 1) {
          phase = 'zoom'
        }
      } else if (phase === 'zoom') {
        zoomProgress = Math.min(zoomProgress + delta / ZOOM_DURATION, 1)
        const t = easeInOut(zoomProgress)

        camera.position.z = THREE.MathUtils.lerp(4.4, FINAL_CAMERA_Z, t)
        camera.fov = THREE.MathUtils.lerp(42, 25, t)
        camera.updateProjectionMatrix()
        atmosphere.material.opacity = THREE.MathUtils.lerp(0.08, 0.18, t)
        cloudMaterial.opacity = THREE.MathUtils.lerp(0.34, 0.5, t)

        if (zoomProgress >= 1) {
          phase = 'done'
          finishIntro()
        }
      }

      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    window.addEventListener('resize', handleResize)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(frameId)
      renderer.dispose()
      earthMaterial.dispose()
      cloudMaterial.dispose()
      starGeo.dispose()
      globe.geometry.dispose()
      clouds.geometry.dispose()
      marker.geometry.dispose()
      marker.material.dispose()
      atmosphere.geometry.dispose()
      atmosphere.material.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#02050c' }}
    />
  )
}
