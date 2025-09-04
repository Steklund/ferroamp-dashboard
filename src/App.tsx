import { useEffect, useState } from 'react'
import Gauge from './components/Gauge'
import CenterGauge from './components/CenterGauge'
import BatteryPercent from './components/BatteryPercent'
import ElprisTable from './components/ElprisTable'
import mqtt from 'mqtt'
import './App.css'
import DeviceTable from './components/DeviceTable'

type Metric = {
  current: string
  min: string
  max: string
}

function App() {
  const [data, setData] = useState<{
    solarPower: Metric
    gridPower: Metric
    usage: Metric
    batteryPower: Metric
  }>({
    solarPower: { current: '-', min: '0', max: '0' },
    gridPower: { current: '-', min: '0', max: '100' },
    usage: { current: '-', min: '-100', max: '100' },
    batteryPower: { current: '-', min: '-100', max: '100' },
  })
  const [soc, setSoc] = useState('-')
  const [esoRows, setEsoRows] = useState<Record<string, any>[]>([])
  const [ssoRows, setSsoRows] = useState<Record<string, any>[]>([])

  useEffect(() => {
    const client = mqtt.connect('ws://localhost:9001')
    client.on('connect', () => {
      client.subscribe('extapi/data/ehub')
      client.subscribe('extapi/data/eso')
      client.subscribe('extapi/data/sso')
    })
    client.on('message', (topic, message) => {
      try {
        const msg = JSON.parse(message.toString())

        // Helper to sum L1, L2, L3 if present
        const sumPhases = (obj: any) => {
          const l1 = parseFloat(obj?.L1 ?? '0')
          const l2 = parseFloat(obj?.L2 ?? '0')
          const l3 = parseFloat(obj?.L3 ?? '0')
          return Math.round(l1 + l2 + l3)
        }

        // Helper to update min/max
        const updateMetric = (
          prev: Metric,
          value: number | undefined
        ): Metric => {
          if (typeof value !== 'number' || isNaN(value)) {
            return prev
          }
          const min =
            prev.min === '-' ? value : Math.min(Number(prev.min), value)
          const max =
            prev.max === '-' ? value : Math.max(Number(prev.max), value)
          return {
            current: value.toString(),
            min: min.toString(),
            max: max.toString(),
          }
        }

        setData(prev => ({
          solarPower: updateMetric(
            prev.solarPower,
            msg.ppv?.val ? Math.round(parseFloat(msg.ppv.val)) : undefined
          ),
          gridPower: updateMetric(
            prev.gridPower,
            msg.pext ? sumPhases(msg.pext) : undefined
          ),
          usage: updateMetric(
            prev.usage,
            msg.pload ? sumPhases(msg.pload) : undefined
          ),
          batteryPower: updateMetric(
            prev.batteryPower,
            msg.pbat?.val ? Math.round(parseFloat(msg.pbat.val)) : undefined
          ),
      }))
      
        // Only set soc if it's a valid number and not zero
        const socVal = parseFloat(msg.soc?.val)
        if (!isNaN(socVal) && socVal !== 0) {
          setSoc(Math.round(socVal).toString())
        }

        if (topic === 'extapi/data/eso') {
          setEsoRows(prev => {
            const id = msg.id?.val
            if (!id) return prev
            const row = {
              id,
              ubat: msg.ubat?.val ? Math.round(Number(msg.ubat.val)) : '-',
              temp: msg.temp?.val ? Math.round(Number(msg.temp.val)) : '-',
              faultcode: msg.faultcode?.val,
            }
            const filtered = prev.filter(r => r.id !== id)
            return [...filtered, row]
          })
        }

        if (topic === 'extapi/data/sso') {
          setSsoRows(prev => {
            const id = msg.id?.val
            if (!id) return prev
            const shortId = id.slice(-9)
            const row = {
              id: shortId,
              upv: msg.upv?.val ? Math.round(Number(msg.upv.val)) : '-',
              temp: msg.temp?.val ? Math.round(Number(msg.temp.val)) : '-',
              faultcode: msg.faultcode?.val,
            }
            const filtered = prev.filter(r => r.id !== shortId)
            return [...filtered, row]
          })
        }
      } catch (e) {
        console.error('MQTT parse error:', e)
      }
    })
    return () => {
      client.end()
    }
  }, [])

  return (
    <div className="dashboard-grid">
      <div className="gauge1">
        <Gauge
          min={Number(data.usage.min)}
          max={Number(data.usage.max)}
          value={Number(data.usage.current)}
          label="FÖRBRUKNING, CONSUMPTION"
          leftLabel={data.usage.min.toString() + " W"}
          rightLabel={data.usage.max.toString() + " W"}
          arcLeftColor="#00f"
          arcRightColor="#bbb"
        />
      </div>
      <div className="gauge2">
        <Gauge
          min={Number(data.solarPower.min)}
          max={Number(data.solarPower.max)}
          value={Number(data.solarPower.current)}
          label="SOLCELLER, SOLAR"
          leftLabel={data.solarPower.min.toString() + " W"}
          rightLabel={data.solarPower.max.toString() + " W"}
          arcLeftColor="#FFBF00"
          arcRightColor="#bbb"
        />
      </div>
      <div className="gauge3">
        <CenterGauge
          min={Math.max(Math.abs(Number(data.batteryPower.min)), Number(data.batteryPower.max)) * -1}
          max={Math.max(Math.abs(Number(data.batteryPower.min)), Number(data.batteryPower.max))}
          value={Number(data.batteryPower.current)}
          label="BATTERI, BATTERY"
          leftLabel={"Laddar, Charging"}
          rightLabel={"Laddar ur, Discharging"}
          arcCenterColor='#bbb'
          arcLeftColor='#084e0bff'
          arcRightColor='#084e0bff'
        />
      </div>
      <div className="gauge4">
        <CenterGauge
          min={Math.max(Math.abs(Number(data.gridPower.min)), Number(data.gridPower.max)) * -1}
          max={Math.max(Math.abs(Number(data.gridPower.min)), Number(data.gridPower.max))}
          value={Number(data.gridPower.current)}
          label="NÄTEFFEKT, GRID"
          leftLabel={"Säljer, Selling"}
          rightLabel={"Köper, buying"}
          arcCenterColor='#bbb'
          arcLeftColor='#000000ff'
          arcRightColor='#000000ff'
        />
      </div>
      <div className="battery">
        <BatteryPercent percent={soc} />
      </div>
      <div className="elpris">
        <ElprisTable />
      </div>
      <div className="sso">
        <h2>SSO</h2>
        <DeviceTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'upv', label: 'UPV (V)' },
            { key: 'temp', label: 'Temperatur (°C)' },
            { key: 'faultcode', label: 'Felkod' },
          ]}
          data={ssoRows}
        />
      </div>
      <div className="eso">
        <h2>ESO</h2>
        <DeviceTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'ubat', label: 'UBAT (V)' },
            { key: 'temp', label: 'Temperatur (°C)' },
            { key: 'faultcode', label: 'Felkod' },
          ]}
          data={esoRows}
        />
      </div>
    </div>
  )
}

export default App
