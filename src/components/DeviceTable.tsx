import React from 'react'

type Column = {
  key: string
  label: string
}

type Props = {
  columns: Column[]
  data: Record<string, any>[]
}

const DeviceTable: React.FC<Props> = ({ columns, data }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', border: '2px solid #000000' }}>
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col.key} style={{ textAlign: 'center', padding: '4px 8px', borderBottom: '1px solid #ccc', border: '2px solid #000000' }}>
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, i) => (
        <tr key={i}>
          {columns.map(col => (
            <td key={col.key} style={{ textAlign: 'center', padding: '4px 8px', borderBottom: '1px solid #eee', border: '2px solid #000000'}}>
              {row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

export default DeviceTable