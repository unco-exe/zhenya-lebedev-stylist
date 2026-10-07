import { useEffect, useRef, useState } from 'react'

export default function ScissorsScene() {
  const mountRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let disposed = false
    let cleanup = () => {}

    import('three').then((THREE) => {
      if (disposed || !mountRef.current) return
      const mount = mountRef.current
      const coarse = window.matchMedia('(pointer: coarse)').matches
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(31, 1, .1, 100)
      camera.position.set(0, .05, 11.8)
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !coarse, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.2 : 1.6))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.55
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.HemisphereLight(0xffffff, 0x292c32, 4.2))
      const key = new THREE.DirectionalLight(0xffffff, 9); key.position.set(-4, 7, 8); scene.add(key)
      const rim = new THREE.DirectionalLight(0xeaf3ff, 7); rim.position.set(7, 1, 6); scene.add(rim)
      const warm = new THREE.PointLight(0xffe3ca, 22, 15); warm.position.set(-2, -4, 6); scene.add(warm)

      const liquidChrome = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafb,
        metalness: 1,
        roughness: .075,
        clearcoat: 1,
        clearcoatRoughness: .025,
        reflectivity: 1,
      })
      const chromeEdge = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: .025, clearcoat: 1 })
      const blackLiquid = new THREE.MeshPhysicalMaterial({
        color: 0x090a0c,
        metalness: .28,
        roughness: .095,
        clearcoat: 1,
        clearcoatRoughness: .03,
        reflectivity: .92,
      })

      const root = new THREE.Group()
      const upperHalf = new THREE.Group()
      const lowerHalf = new THREE.Group()

      const bladeShape = new THREE.Shape()
      bladeShape.moveTo(.04, -.15)
      bladeShape.lineTo(3.78, -.105)
      bladeShape.quadraticCurveTo(4.28, -.045, 4.62, .015)
      bladeShape.quadraticCurveTo(4.22, .11, 3.76, .16)
      bladeShape.lineTo(.05, .24)
      bladeShape.quadraticCurveTo(-.02, .03, .04, -.15)
      const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, { depth: .105, bevelEnabled: true, bevelSegments: 3, bevelSize: .028, bevelThickness: .028 })
      bladeGeometry.translate(0, 0, -.052)

      const edgeShape = new THREE.Shape()
      edgeShape.moveTo(.3, -.16); edgeShape.lineTo(4.57, .008); edgeShape.lineTo(3.75, -.065); edgeShape.closePath()
      const edgeGeometry = new THREE.ExtrudeGeometry(edgeShape, { depth: .032, bevelEnabled: false })
      edgeGeometry.translate(0, 0, .055)

      const makeHalf = (group, sign, z) => {
        group.position.z = z
        group.add(new THREE.Mesh(bladeGeometry, liquidChrome))
        group.add(new THREE.Mesh(edgeGeometry, chromeEdge))
        const shankCurve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(-.02, 0, 0), new THREE.Vector3(-.55, sign * .04, 0),
          new THREE.Vector3(-.78, sign * .72, 0), new THREE.Vector3(-1.38, sign * .83, 0),
        )
        group.add(new THREE.Mesh(new THREE.TubeGeometry(shankCurve, 32, .165, 20, false), blackLiquid))
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.66, .15, 24, 72), blackLiquid)
        ring.position.set(-1.83, sign * .88, 0); ring.scale.set(1.08, 1, 1); group.add(ring)
        const bridgeCurve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(-1.3, sign * .8, 0), new THREE.Vector3(-1.48, sign * .86, 0),
          new THREE.Vector3(-1.58, sign * .88, 0), new THREE.Vector3(-1.7, sign * .88, 0),
        )
        group.add(new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve, 18, .155, 18, false), blackLiquid))
        if (sign < 0) {
          const tangCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(-2.35, -.88, 0), new THREE.Vector3(-2.75, -.8, 0),
            new THREE.Vector3(-2.86, -.58, 0), new THREE.Vector3(-3.2, -.55, 0),
          )
          group.add(new THREE.Mesh(new THREE.TubeGeometry(tangCurve, 24, .108, 18, false), blackLiquid))
          const rest = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .42, 8, 20), blackLiquid)
          rest.rotation.z = Math.PI / 2; rest.position.set(-3.22, -.54, 0); group.add(rest)
        }
      }

      makeHalf(upperHalf, 1, .055)
      makeHalf(lowerHalf, -1, -.055)
      upperHalf.rotation.z = .31
      lowerHalf.rotation.z = -.31
      root.add(upperHalf, lowerHalf)

      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(.34, .37, .19, 64), liquidChrome)
      hinge.rotation.x = Math.PI / 2; hinge.position.z = .08; root.add(hinge)
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .21, 48), blackLiquid)
      screw.rotation.x = Math.PI / 2; screw.position.z = .19; root.add(screw)
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .22, 48), chromeEdge)
      cap.rotation.x = Math.PI / 2; cap.position.z = .205; root.add(cap)

      root.rotation.set(-.08, -.2, -.48)
      root.position.set(.25, -.05, 0)
      scene.add(root)

      const render = () => renderer.render(scene, camera)
      const resize = () => {
        const w = mount.clientWidth || 1, h = mount.clientHeight || 1
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        root.scale.setScalar(w / h < .78 ? .56 : .88)
        render()
      }
      resize()
      window.addEventListener('resize', resize)
      setReady(true)

      cleanup = () => {
        window.removeEventListener('resize', resize)
        scene.traverse((object) => {
          object.geometry?.dispose?.()
          if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose())
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    }).catch(() => setReady(false))

    return () => { disposed = true; cleanup() }
  }, [])

  return <div className={`scissors-scene ${mounted ? 'is-mounted' : ''} ${ready ? 'webgl-ready' : ''}`} ref={mountRef} aria-hidden="true">
    <img className="scissors-fallback-image" src="/assets/scissors-reference.png" alt="" />
  </div>
}
