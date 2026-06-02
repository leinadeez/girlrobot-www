'use client'

import { useTheme } from '../context/theme'
import MatrixRain from './matrix-rain/MatrixRain'
import RadialRipple from './radial-ripple/RadialRipple'
import Columns from './columns/Columns'
import Stars from './stars/Stars'
import HypnoSpiral from './hypno-spiral/HypnoSpiral'
import HexFire from './hex-fire/HexFire'
import HexCorp from './hex-corp/HexCorp'
import Cubes from './cubes/Cubes'
import SaoPaulo from './sao-paulo/SaoPaulo'
import FrutigerAero from './frutiger-aero/FrutigerAero'
import Candy from './candy/Candy'

export default function ThemeProvider() {
    const { theme } = useTheme()

    if (theme === 'matrix') return <MatrixRain />
    if (theme === 'ripple') return <RadialRipple />
    if (theme === 'columns') return <Columns />
    if (theme === 'stars') return <Stars />
    if (theme === 'spiral') return <HypnoSpiral />
    if (theme === 'hexfire') return <HexFire />
    if (theme === 'hexcorp') return <HexCorp />
    if (theme === 'cubes') return <Cubes />
    if (theme === 'saopaulo') return <SaoPaulo />
    if (theme === 'frutiger') return <FrutigerAero />
    if (theme === 'candy') return <Candy />
    return null
}
