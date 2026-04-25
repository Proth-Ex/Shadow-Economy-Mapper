import { useEffect, useRef } from "react";
import * as THREE from "three";

// Target coordinates for Goa
const GOA_LAT = 15.4989;
const GOA_LNG = 73.8278;

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function GlobeIntro({ onComplete }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    // Camera starts far out
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 4);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Globe
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshPhongMaterial({
      map: textureLoader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
      ),
      specularMap: textureLoader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg"
      ),
      specular: new THREE.Color(0x333333),
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 8000; i++) {
      starVerts.push((Math.random() - 0.5) * 300);
      starVerts.push((Math.random() - 0.5) * 300);
      starVerts.push((Math.random() - 0.5) * 300);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starVerts, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 }));
    scene.add(stars);

    // Target position above Goa
    const goaTarget = latLngToVector3(GOA_LAT, GOA_LNG, 1);

    let phase = "spin";       // spin → align → zoom → done
    let spinTime = 0;
    let alignProgress = 0;
    let zoomProgress = 0;
    const SPIN_DURATION = 2.5;   // seconds of free spin
    const ALIGN_DURATION = 1.5;  // rotate globe to face Goa
    const ZOOM_DURATION = 2.0;   // camera zoom in

    const startAlign = new THREE.Euler().copy(globe.rotation);
    const clock = new THREE.Clock();

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function animate() {
      const delta = clock.getDelta();
      requestAnimationFrame(animate);

      if (phase === "spin") {
        globe.rotation.y += 0.004;
        spinTime += delta;
        if (spinTime > SPIN_DURATION) {
          phase = "align";
          startAlign.copy(globe.rotation);
        }
      } else if (phase === "align") {
        alignProgress = Math.min(alignProgress + delta / ALIGN_DURATION, 1);
        const t = easeInOut(alignProgress);
        // Rotate globe so Goa faces camera
        const targetY = -THREE.MathUtils.degToRad(GOA_LNG);
        const targetX = -THREE.MathUtils.degToRad(GOA_LAT - 10);
        globe.rotation.y = THREE.MathUtils.lerp(startAlign.y, targetY, t);
        globe.rotation.x = THREE.MathUtils.lerp(startAlign.x, targetX, t);
        if (alignProgress >= 1) phase = "zoom";
      } else if (phase === "zoom") {
        zoomProgress = Math.min(zoomProgress + delta / ZOOM_DURATION, 1);
        const t = easeInOut(zoomProgress);
        camera.position.z = THREE.MathUtils.lerp(4, 1.08, t);
        camera.position.x = THREE.MathUtils.lerp(0, goaTarget.x * 0.3, t);
        camera.position.y = THREE.MathUtils.lerp(0, goaTarget.y * 0.3, t);
        if (zoomProgress >= 1) {
          phase = "done";
          setTimeout(() => onComplete(), 400);
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 9999 }} />;
}