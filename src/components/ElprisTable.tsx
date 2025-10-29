import React, { useEffect, useState } from 'react'
import styles from './ElprisTable.module.css'

interface ElprisTableProps {
  tomorrow?: boolean
}

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

function getApiUrl(forTomorrow = false): string {
  const now = new Date()
  if (forTomorrow) {
    now.setDate(now.getDate() + 1)
  }
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const return_url = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_SE1.json`
  console.log("fetching from " + return_url)
  return return_url
}

const ElprisTable: React.FC<ElprisTableProps> = ({ tomorrow = false }) => {
  const [rows, setRows] = useState<PriceRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = async () => {
    try {
      setError(null) // nollställ ev. tidigare fel
      const res = await fetch(getApiUrl(tomorrow))
      console.log(res.status, res.headers.get('content-type'));

      if (!res.ok) {
        throw new Error(`Fel vid hämtning: ${res.status}`)
      }

      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setRows([])
        setError('Inga prisuppgifter tillgängliga för valt datum.')
        return
      }

      const raw = data.filter((row: any) => {
        const hour = Number(row.time_start.slice(11, 13))
        return hour
      })

      const hourlyMap = new Map<number, { sum: number; count: number }>()
      for (const row of raw) {
        const hour = Number(row.time_start.slice(11, 13))
        const val = Number(row.SEK_per_kWh) || 0
        const entry = hourlyMap.get(hour) ?? { sum: 0, count: 0 }
        entry.sum += val
        entry.count += 1
        hourlyMap.set(hour, entry)
      }

      const filtered: PriceRow[] = Array.from(hourlyMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([hour, { sum, count }]) => {
          const start = String(hour).padStart(2, '0') + ':00'
          const end = hour === 23 ? '00:00' : String(hour + 1).padStart(2, '0') + ':00'
          const avg = count > 0 ? sum / count : 0
          return {
            hour: `${start}–${end}`,
            price: Math.round(avg * 100),
            color: 'default'
          }
        })

      const sorted = [...filtered].sort((a, b) => a.price - b.price)
      const cheapest = new Set(sorted.slice(0, 5).map(r => r.hour))
      const priciest = new Set(sorted.slice(-5).map(r => r.hour))

      setRows(
        filtered.map((row: PriceRow): PriceRow => ({
          ...row,
          color: priciest.has(row.hour)
            ? 'red'
            : cheapest.has(row.hour)
              ? 'green'
              : 'default'
        }))
      )
    } catch (e: any) {
      setError('Inga tillgängliga elpriser. No price data available.')
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

  const heading = tomorrow ? 'Elpris imorgon (Elområde 1)' : 'Elpris idag (Elområde 1)'

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>{heading}</h3>

      {error ? (
        <p className={styles.error}>{error}</p>
      ) : rows.length === 0 ? (
        <p className={styles.info}>Hämtar prisdata...</p>
      ) : (
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
      )}
    </div>
  )
}

export default ElprisTable
