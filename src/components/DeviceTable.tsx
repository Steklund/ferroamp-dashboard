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
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col.key} style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #ccc' }}>
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, i) => (
        <tr key={i}>
          {columns.map(col => (
            <td key={col.key} style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>
              {row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

export default DeviceTable