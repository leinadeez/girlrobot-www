'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const HEX_RADIUS = 80
const HEX_GAP = 40
const HEX_DEPTH = 10
const PULSE_SPEED = 0.8
const WAVE_SPREAD = 0.04

const AMBER = new THREE.Color('#ffcc44').multiplyScalar(2.5)
const AMBER_DIM = new THREE.Color('#0d0400')

function buildHexGrid(width: number, height: number) {
    const r = HEX_RADIUS + HEX_GAP / 2
    const colW = r * Math.sqrt(3)
    const rowH = r * 1.5

    const positions: { x: number; y: number }[] = []
    const cols = Math.ceil(width / colW) + 2
    const rows = Math.ceil(height / rowH) + 2

    for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
            const x = col * colW + (row % 2 === 0 ? 0 : colW / 2) - width / 2
            const y = row * rowH - height / 2
            positions.push({ x, y })
        }
    }

    return positions
}

export default function HexGrid() {
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

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(window.devicePixelRatio)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#000000')

        const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100)
        camera.position.set(0, 0, 10)
        camera.lookAt(0, 0, 0)

        const positions = buildHexGrid(W, H)
        const count = positions.length

        // --- Hex face mesh ---
        const hexGeo = new THREE.CylinderGeometry(HEX_RADIUS, HEX_RADIUS, HEX_DEPTH, 6, 1, false)
        hexGeo.rotateX(Math.PI / 2)

        const hexMat = new THREE.MeshStandardMaterial({
            color: AMBER_DIM,
            emissive: AMBER,
            emissiveIntensity: 0,
            roughness: 0.4,
            metalness: 0.6,
        })

        const mesh = new THREE.InstancedMesh(hexGeo, hexMat, count)
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

        const dummy = new THREE.Object3D()
        const offsets = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            dummy.position.set(positions[i].x, positions[i].y, 0)
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
            offsets[i] = (positions[i].x + positions[i].y) * WAVE_SPREAD
        }
        mesh.instanceMatrix.needsUpdate = true
        scene.add(mesh)

        // --- Hex edge lines (merged geometry, vertex-colored) ---
        const edgesGeo = new THREE.EdgesGeometry(hexGeo)
        const edgeTemplate = edgesGeo.attributes.position.array as Float32Array
        const vertsPerHex = edgeTemplate.length / 3

        const allEdgePositions = new Float32Array(count * edgeTemplate.length)
        const allEdgeColors = new Float32Array(count * edgeTemplate.length)

        for (let i = 0; i < count; i++) {
            const { x, y } = positions[i]
            const base = i * edgeTemplate.length
            for (let v = 0; v < edgeTemplate.length; v += 3) {
                allEdgePositions[base + v]     = edgeTemplate[v] + x
                allEdgePositions[base + v + 1] = edgeTemplate[v + 1] + y
                allEdgePositions[base + v + 2] = edgeTemplate[v + 2] + 1 // slightly in front
            }
        }

        const linesGeo = new THREE.BufferGeometry()
        linesGeo.setAttribute('position', new THREE.BufferAttribute(allEdgePositions, 3))
        linesGeo.setAttribute('color', new THREE.BufferAttribute(allEdgeColors, 3))

        const linesMat = new THREE.LineBasicMaterial({ vertexColors: true })
        const lines = new THREE.LineSegments(linesGeo, linesMat)
        scene.add(lines)

        // ---

        const ambientLight = new THREE.AmbientLight('#ffffff', 0.2)
        scene.add(ambientLight)

        const composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 3.2, 0.8, 0.05))

        const faceColor = new THREE.Color()
        const edgeColorArr = linesGeo.attributes.color.array as Float32Array
        let rafId: number
        let t = 0

        const render = () => {
            t += 0.016 * PULSE_SPEED

            for (let i = 0; i < count; i++) {
                const intensity = (Math.sin(t + offsets[i]) + 1) / 2

                // Face color
                faceColor.lerpColors(AMBER_DIM, AMBER, intensity)
                mesh.setColorAt(i, faceColor)

                // Edge color — same lerp but pushed brighter at peak
                const er = AMBER_DIM.r + (AMBER.r - AMBER_DIM.r) * intensity
                const eg = AMBER_DIM.g + (AMBER.g - AMBER_DIM.g) * intensity
                const eb = AMBER_DIM.b + (AMBER.b - AMBER_DIM.b) * intensity
                const vertBase = i * vertsPerHex
                for (let v = 0; v < vertsPerHex; v++) {
                    const idx = (vertBase + v) * 3
                    edgeColorArr[idx]     = er
                    edgeColorArr[idx + 1] = eg
                    edgeColorArr[idx + 2] = eb
                }
            }

            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
            linesGeo.attributes.color.needsUpdate = true

            composer.render()
            rafId = requestAnimationFrame(render)
        }

        rafId = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(rafId)
            renderer.dispose()
            hexGeo.dispose()
            hexMat.dispose()
            edgesGeo.dispose()
            linesGeo.dispose()
            linesMat.dispose()
        }
    }, [resizeKey])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
            }}
        />
    )
}
