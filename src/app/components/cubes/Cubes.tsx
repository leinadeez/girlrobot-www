'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const FRUSTUM = 300
const SPIN_DURATION = 0.6
const PAUSE_DURATION = 0.6
const CUBE_SIZE = 140
const COLS = 4
const ROWS = 3
const H_SPACING = 380
const V_SPACING = 300

function easeInOut(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function Cubes() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [resizeKey, setResizeKey] = useState(0)

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        const onResize = () => {
            clearTimeout(timeout)
            timeout = setTimeout(() => setResizeKey(k => k + 1), 300)
        }
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
            clearTimeout(timeout)
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const W = window.innerWidth
        const H = window.innerHeight
        const aspect = W / H

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(window.devicePixelRatio)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#000d2e')

        const camera = new THREE.OrthographicCamera(
            -FRUSTUM * aspect, FRUSTUM * aspect,
            FRUSTUM, -FRUSTUM,
            0.1, 5000
        )
        camera.position.set(600, 480, 600)
        camera.lookAt(0, 0, 0)

        const cubeGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
        const edgeMat = new THREE.LineBasicMaterial({ color: '#e8a060', transparent: true, opacity: 0.8 })
        const edgeGeo = new THREE.EdgesGeometry(cubeGeo)

        // Camera right and up vectors for isometric camera at (600,480,600) → (0,0,0)
        const camRight = new THREE.Vector3(0.707, 0, -0.707)
        const camUp = new THREE.Vector3(-0.348, 0.870, -0.348)

        const groups: THREE.Group[] = []
        const materials: THREE.MeshStandardMaterial[] = []

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const stagger = (row % 2) * (H_SPACING / 2)
                const hOffset = (col - (COLS - 1) / 2) * H_SPACING + stagger
                const vOffset = (row - (ROWS - 1) / 2) * V_SPACING
                const pos = camRight.clone().multiplyScalar(hOffset)
                    .addScaledVector(camUp, vOffset)

                const mat = new THREE.MeshStandardMaterial({
                    color: '#000000',
                    emissive: '#b87333',
                    emissiveIntensity: 0.675,
                    roughness: 0.4,
                    metalness: 0.0,
                })
                materials.push(mat)

                const cube = new THREE.Mesh(cubeGeo, mat)
                const edges = new THREE.LineSegments(edgeGeo, edgeMat)
                const group = new THREE.Group()
                group.add(cube)
                group.add(edges)
                group.position.copy(pos)
                scene.add(group)
                groups.push(group)
            }
        }

        const composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.7, 0.6, 0.15))

        let phase: 'spinning' | 'paused' = 'spinning'
        let phaseTime = 0
        let baseAngleX = 0
        let baseAngleY = 0
        let axis: 'y' | 'x' = 'y'
        let lastTime = performance.now()
        let rafId: number

        const render = () => {
            const now = performance.now()
            const delta = (now - lastTime) / 1000
            lastTime = now
            phaseTime += delta

            if (phase === 'spinning') {
                const t = Math.min(phaseTime / SPIN_DURATION, 1)
                const delta90 = easeInOut(t) * (Math.PI / 2)
                if (axis === 'y') {
                    for (const g of groups) g.rotation.y = baseAngleY - delta90
                } else {
                    for (const g of groups) g.rotation.x = baseAngleX - delta90
                }
                if (t >= 1) {
                    if (axis === 'y') { baseAngleY -= Math.PI / 2 }
                    else              { baseAngleX -= Math.PI / 2 }
                    axis = axis === 'y' ? 'x' : 'y'
                    phase = 'paused'
                    phaseTime = 0
                }
            } else {
                if (phaseTime >= PAUSE_DURATION) {
                    phase = 'spinning'
                    phaseTime = 0
                }
            }

            for (let i = 0; i < materials.length; i++) {
                const row = Math.floor(i / COLS)
                const col = i % COLS
                const wave = Math.sin(now / 1000 * 1.5 + (row + col) * 0.9)
                materials[i].emissiveIntensity = 0.675 + Math.max(0, wave) * 0.25
            }

            composer.render()
            rafId = requestAnimationFrame(render)
        }

        rafId = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(rafId)
            renderer.dispose()
            cubeGeo.dispose()
            edgeGeo.dispose()
            edgeMat.dispose()
            for (const m of materials) m.dispose()
        }
    }, [resizeKey])

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
        />
    )
}
