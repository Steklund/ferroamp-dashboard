import { useEffect, useState } from 'react'
import DeviceTable from './DeviceTable'
import {
  ANNUAL_CALL_LIMIT,
  BATTERY_NAMES,
  BUDGET_SAFETY_FACTOR,
  DEVICE_LIST_CALLS_PER_DAY,
  DEVICE_LIST_RETRY_MIN,
  MIN_OFFICE_INTERVAL_MIN,
  OFF_HOURS_INTERVAL_MIN,
  OFFICE_END_HOUR,
  OFFICE_START_HOUR,
} from '../solarmanConfig'

type BatteryRow = {
  sn: string
  name: string
  soc: string
  power: string
}

type DataItem = { key: string; value: string | null }

const MINUTE = 60_000

function isOfficeHours(date: Date): boolean {
  const h = date.getHours()
  return h >= OFFICE_START_HOUR && h < OFFICE_END_HOUR
}

/**
 * Office-hours polling interval (minutes) that keeps the yearly call count
 * within budget for the given number of batteries (1 call per battery per cycle).
 */
function officeIntervalMin(batteryCount: number): number {
  const dailyBudget =
    (ANNUAL_CALL_LIMIT * BUDGET_SAFETY_FACTOR) / 365 - DEVICE_LIST_CALLS_PER_DAY
  const cyclesPerDay = dailyBudget / Math.max(batteryCount, 1)
  const officeMinutes = (OFFICE_END_HOUR - OFFICE_START_HOUR) * 60
  const offHoursCycles = (24 * 60 - officeMinutes) / OFF_HOURS_INTERVAL_MIN
  const officeCycles = cyclesPerDay - offHoursCycles
  if (officeCycles <= 0) return OFF_HOURS_INTERVAL_MIN
  return Math.max(MIN_OFFICE_INTERVAL_MIN, Math.ceil(officeMinutes / officeCycles))
}

async function fetchBatterySns(): Promise<string[]> {
  const res = await fetch('/api/solarman/devices')
  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json.msg ?? `HTTP ${res.status}`)
  }
  return (json.deviceListItems ?? [])
    .filter((d: { deviceType: string }) => d.deviceType === 'BATTERY')
    .map((d: { deviceSn: string | number }) => String(d.deviceSn))
}

function formatNumber(value: string | null | undefined): string {
  const n = Number(value)
  return value == null || value === '' || isNaN(n) ? '-' : Math.round(n).toString()
}

async function fetchBattery(deviceSn: string): Promise<BatteryRow> {
  const res = await fetch(`/api/solarman/device/${encodeURIComponent(deviceSn)}`)
  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json.msg ?? `HTTP ${res.status}`)
  }
  const values = new Map<string, string | null>(
    (json.dataList ?? []).map((d: DataItem) => [d.key, d.value])
  )
  const sn1 = values.get('SN1') ?? deviceSn
  return {
    sn: deviceSn,
    name: BATTERY_NAMES[sn1] ?? BATTERY_NAMES[deviceSn] ?? sn1,
    soc: formatNumber(values.get('SOC_BAP1')),
    power: formatNumber(values.get('B_P1')),
  }
}

function formatTime(date: Date | null): string {
  return date
    ? date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    : '-'
}

export default function SolarmanTable() {
  const [rows, setRows] = useState<BatteryRow[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let sns: string[] = []

    const schedule = (delayMs: number, fn: () => void) => {
      if (cancelled) return
      setNextUpdate(new Date(Date.now() + delayMs))
      timer = setTimeout(fn, delayMs)
    }

    const poll = async () => {
      // Sequential to stay gentle on the API's rate limits.
      for (const sn of sns) {
        if (cancelled) return
        try {
          const row = await fetchBattery(sn)
          if (cancelled) return
          setRows(prev => prev.map(r => (r.sn === sn ? row : r)))
          setError(null)
        } catch (e) {
          console.error(`Solarman: failed to fetch ${sn}:`, e)
          setError(`Kunde inte hämta ${sn}`)
        }
      }
      setLastUpdate(new Date())
      const intervalMin = isOfficeHours(new Date())
        ? officeIntervalMin(sns.length)
        : OFF_HOURS_INTERVAL_MIN
      schedule(intervalMin * MINUTE, poll)
    }

    const init = async () => {
      try {
        sns = await fetchBatterySns()
        if (cancelled) return
        setRows(
          sns.map(sn => ({ sn, name: BATTERY_NAMES[sn] ?? sn, soc: '-', power: '-' }))
        )
        console.info(
          `Solarman: ${sns.length} batteries, office-hours interval ` +
            `${officeIntervalMin(sns.length)} min, off-hours ${OFF_HOURS_INTERVAL_MIN} min`
        )
        await poll()
      } catch (e) {
        console.error('Solarman: failed to fetch device list:', e)
        setError('Kunde inte hämta batterilistan')
        schedule(DEVICE_LIST_RETRY_MIN * MINUTE, init)
      }
    }

    init()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  const sortedRows = [...rows].sort((a, b) =>
    a.name.localeCompare(b.name, 'sv', { numeric: true })
  )

  return (
    <>
      <DeviceTable
        columns={[
          { key: 'name', label: 'Battery' },
          { key: 'soc', label: 'SOC (%)' },
          { key: 'power', label: 'Power (W)' },
        ]}
        data={sortedRows}
      />
      <small style={{ marginTop: '-1.5rem' }}>
        Uppdaterad {formatTime(lastUpdate)} · nästa {formatTime(nextUpdate)}
        {error && <span style={{ color: '#c00' }}> · {error}</span>}
      </small>
    </>
  )
}
