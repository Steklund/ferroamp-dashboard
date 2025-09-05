import React, { useEffect, useState } from 'react'
import styles from './ElprisTable.module.css'

type PriceRow = {
  hour: string
  price: number
  color: 'green' | 'red' | 'default'
}

function getNextMidnight(): number {
  const now = new Date()
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - now.getTime()
}

function getApiUrl(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_SE1.json`
}

const ElprisTable: React.FC = () => {
  const [rows, setRows] = useState<PriceRow[]>([])

  const fetchPrices = async () => {
    try {
      const res = await fetch(getApiUrl())
      const data = await res.json()
      // Filter for hours between 06:00 and 21:00
      const filtered = data
        .filter((row: any) => {
          const hour = Number(row.time_start.slice(11, 13))
          return hour >= 6 && hour <= 20
        })
        .map((row: any) => {
          const start = row.time_start.slice(11, 16)
          const endHour = String(Number(start.slice(0, 2)) + 1).padStart(2, '0')
          const end = `${endHour}:00`
          return {
            hour: `${start}–${end}`,
            price: Math.round(row.SEK_per_kWh * 100)
          }
        })

      // Find 5 cheapest and 5 priciest
      const sorted = [...filtered].sort((a, b) => a.price - b.price)
      const cheapest = sorted.slice(0, 5).map(r => r.hour)
      const priciest = sorted.slice(-5).map(r => r.hour)

      // Add color info
      setRows(
        filtered.map((row: PriceRow): PriceRow => ({
          ...row,
          color:
            priciest.includes(row.hour)
              ? 'red'
              : cheapest.includes(row.hour)
                ? 'green'
                : 'default'
        }))
      )
    } catch (e) {
      setRows([])
    }
  }

  useEffect(() => {
    const scheduleFetch = () => {
      fetchPrices()
      const timeout = setTimeout(scheduleFetch, getNextMidnight())
      return () => clearTimeout(timeout)
    }

    const cleanup = scheduleFetch()
    return cleanup
  }, [])


  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Elpris Elområde 1</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Tid, Time</th>
            <th className={styles.thRight}>(Öre/kWh)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={row.hour}
              className={
                row.color === 'green'
                  ? styles.rowGreen
                  : row.color === 'red'
                    ? styles.rowRed
                    : styles.rowDefault
              }
            >
              <td className={styles.td}>{row.hour}</td>
              <td className={styles.tdRight}>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ElprisTable