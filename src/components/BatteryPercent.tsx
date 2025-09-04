import React from 'react'
import styles from './BatteryPercent.module.css'

type Props = {
  percent: number | string
}

// Convert percent to a gradient color from green -> yellow -> red
function getGradientColor(percent: number) {
  // Clamp percent between 0 and 100
  const p = Math.min(100, Math.max(0, percent))

  let r: number, g: number

  if (p > 50) {
    // Green to yellow (50-100%)
    r = Math.round(255 * (1 - (p - 50) / 50)) // Red increases as we go down
    g = 255
  } else {
    // Yellow to red (0-50%)
    r = 255
    g = Math.round(255 * (p / 50)) // Green decreases as we go down
  }

  return `rgb(${r}, ${g}, 0)`
}

const BatteryPercent: React.FC<Props> = ({ percent }) => {
  const num = typeof percent === 'string' ? parseFloat(percent) : percent
  const safeNum = isNaN(num) ? 0 : num
  const color = getGradientColor(safeNum)

  return (
    <div className={styles.container} style={{ background: color }}>
      <div className={styles.label}>BATTERI, BATTERY</div>
      <div className={styles.value}>
        {isNaN(num) ? '-' : `${num}%`}
      </div>
    </div>
  )
}

export default BatteryPercent
