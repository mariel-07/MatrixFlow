/**
 * Utilidades de exportación para FASE 7: Exportaciones futuras (PDF, CSV, Excel, JSON)
 */

export interface ExportDataPayload {
  general?: { module: string; total: number }[]
  salesByBranch?: any[]
  salesByProduct?: any[]
  targetCompliance?: any[]
  inventoryRotation?: any[]
  operations?: any[]
  recentActivity?: any[]
  processingIndicators?: any
  generatedBy?: string
  dateRange?: string
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadJSON(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateFullReportCSV(data: ExportDataPayload): string {
  const lines: string[] = []

  lines.push('MATRIXFLOW ENTERPRISE - REPORTE EJECUTIVO INTEGRAL')
  lines.push(`Fecha de Emisión:,"${new Date().toLocaleString('es-PE')}"`)
  if (data.generatedBy) {
    lines.push(`Generado por:,"${data.generatedBy}"`)
  }
  lines.push('')

  // 1. Indicadores de Procesamiento
  if (data.processingIndicators) {
    lines.push('=== INDICADORES DE PROCESAMIENTO MATEMÁTICO ===')
    lines.push('Métrica,Valor')
    lines.push(`Total Operaciones,${data.processingIndicators.total_operations || 0}`)
    lines.push(`Operaciones Completadas,${data.processingIndicators.completed_operations || 0}`)
    lines.push(`Tasa de Éxito,${data.processingIndicators.success_rate || 0}%`)
    lines.push(`Tiempo Promedio de Ejecución,${data.processingIndicators.avg_execution_time_ms || 0} ms`)
    lines.push(`Operaciones de Matrices,${data.processingIndicators.matrix_operations || 0}`)
    lines.push(`Operaciones de Vectores,${data.processingIndicators.vector_operations || 0}`)
    lines.push(`Combinaciones Lineales,${data.processingIndicators.linear_combinations || 0}`)
    lines.push(`Estado del Motor,${data.processingIndicators.engine_status || 'Óptimo'}`)
    lines.push('')
  }

  // 2. Ventas por Sucursal
  if (data.salesByBranch && data.salesByBranch.length > 0) {
    lines.push('=== VENTAS POR SUCURSAL ===')
    lines.push('ID Sucursal,Nombre Sucursal,Total Ventas (PEN),N° Transacciones,% del Total')
    data.salesByBranch.forEach((b) => {
      lines.push(
        `${b.branch_id},"${b.branch}",${Number(b.total_sales || 0).toFixed(2)},${b.sales_count || 0},${Number(b.percentage || 0).toFixed(2)}%`
      )
    })
    lines.push('')
  }

  // 3. Ventas por Producto
  if (data.salesByProduct && data.salesByProduct.length > 0) {
    lines.push('=== VENTAS POR PRODUCTO ===')
    lines.push('ID Producto,Nombre Producto,Total Ventas (PEN),Unidades Vendidas,% del Total')
    data.salesByProduct.forEach((p) => {
      lines.push(
        `${p.product_id},"${p.product}",${Number(p.total_sales || 0).toFixed(2)},${p.quantity_sold || 0},${Number(p.percentage || 0).toFixed(2)}%`
      )
    })
    lines.push('')
  }

  // 4. Cumplimiento de Metas
  if (data.targetCompliance && data.targetCompliance.length > 0) {
    lines.push('=== CUMPLIMIENTO DE METAS POR SUCURSAL ===')
    lines.push('ID Meta,Sucursal,Objetivo/Meta,Meta (PEN),Venta Lograda (PEN),% Cumplimiento,Estado')
    data.targetCompliance.forEach((t) => {
      lines.push(
        `${t.target_id},"${t.branch}","${t.target}",${Number(t.target_value || 0).toFixed(2)},${Number(t.sales || 0).toFixed(2)},${Number(t.compliance_percentage || 0).toFixed(2)}%,"${t.status || ''}"`
      )
    })
    lines.push('')
  }

  // 5. Inventario y Rotación
  if (data.inventoryRotation && data.inventoryRotation.length > 0) {
    lines.push('=== INVENTARIO Y ROTACIÓN ===')
    lines.push('ID,Producto,Sucursal,Stock Actual,Unidades Vendidas,Índice Rotación,Estado,Velocidad')
    data.inventoryRotation.forEach((i) => {
      lines.push(
        `${i.inventory_id},"${i.product}","${i.branch}",${i.quantity || 0},${i.quantity_sold || 0},${Number(i.rotation || 0).toFixed(2)},"${i.status || ''}","${i.rotation_speed || ''}"`
      )
    })
    lines.push('')
  }

  // 6. Resultados Matemáticos
  if (data.operations && data.operations.length > 0) {
    lines.push('=== RESULTADOS DE OPERACIONES MATEMÁTICAS ===')
    lines.push('ID,Tipo de Operación,Estado,Resultado Resumido,Fecha')
    data.operations.forEach((o) => {
      const resStr = typeof o.result === 'object' ? JSON.stringify(o.result).replace(/"/g, '""') : String(o.result || '')
      lines.push(`${o.id},"${o.operation_type}","${o.status}","${resStr}","${o.created_at || ''}"`)
    })
    lines.push('')
  }

  // 7. Actividad Reciente / Auditoría
  if (data.recentActivity && data.recentActivity.length > 0) {
    lines.push('=== ACTIVIDAD RECIENTE Y AUDITORÍA (FASE 6) ===')
    lines.push('ID,Usuario,Acción,Módulo,IP,Estado,Resultado,Fecha')
    data.recentActivity.forEach((a) => {
      lines.push(
        `${a.id},"${a.username || ''}","${a.action || ''}","${a.module || ''}","${a.ip_address || ''}","${a.status || ''}","${(a.result || '').replace(/"/g, '""')}","${a.created_at || ''}"`
      )
    })
  }

  return lines.join('\r\n')
}

export function printExecutiveReport(data: ExportDataPayload) {
  const printWindow = window.open('', '_blank', 'width=1000,height=800')
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes para imprimir el reporte.')
    return
  }

  const formatPEN = (val: number) => `S/ ${Number(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Ejecutivo - MatrixFlow Enterprise</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 30px; font-size: 12px; }
    h1 { font-size: 20px; margin: 0; color: #1e3a8a; }
    h2 { font-size: 14px; margin-top: 25px; margin-bottom: 8px; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
    .badge { background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
    .kpi { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; background: #f8fafc; }
    .kpi-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .kpi-val { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
    th { background: #f1f5f9; text-align: left; padding: 6px 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
    td { padding: 6px 10px; border: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #fafafa; }
    .text-right { text-align: right; }
    .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    .tag-green { background: #ecfdf5; color: #047857; }
    .tag-blue { background: #eff6ff; color: #1d4ed8; }
    .tag-amber { background: #fffbeb; color: #b45309; }
    .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { margin: 15mm; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>MatrixFlow Enterprise · Reporte Ejecutivo</h1>
      <p style="margin: 3px 0 0 0; color: #64748b;">Plan Maestro de Desarrollo - Versión 1.0 (Fases 6 y 7)</p>
    </div>
    <div style="text-align: right;">
      <span class="badge">CONFIDENCIAL</span>
      <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b;">Emisión: ${new Date().toLocaleString('es-PE')}</p>
    </div>
  </div>

  <!-- Indicadores de Procesamiento -->
  ${data.processingIndicators
      ? `
  <h2>Indicadores de Procesamiento del Motor Matemático</h2>
  <div class="grid">
    <div class="kpi">
      <div class="kpi-title">Total Operaciones</div>
      <div class="kpi-val">${data.processingIndicators.total_operations}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Tasa de Éxito</div>
      <div class="kpi-val" style="color: #047857;">${data.processingIndicators.success_rate}%</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Tiempo Promedio</div>
      <div class="kpi-val">${data.processingIndicators.avg_execution_time_ms} ms</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Estado del Motor</div>
      <div class="kpi-val" style="color: #1d4ed8;">${data.processingIndicators.engine_status}</div>
    </div>
  </div>
  `
      : ''
    }

  <!-- Ventas por Sucursal -->
  <h2>Ventas por Sucursal</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Sucursal</th>
        <th class="text-right">N° Transacciones</th>
        <th class="text-right">Total Ventas</th>
        <th class="text-right">% Aporte</th>
      </tr>
    </thead>
    <tbody>
      ${(data.salesByBranch || [])
      .map(
        (b) => `
        <tr>
          <td>${b.branch_id}</td>
          <td><strong>${b.branch}</strong></td>
          <td class="text-right">${b.sales_count || 1}</td>
          <td class="text-right">${formatPEN(b.total_sales)}</td>
          <td class="text-right">${Number(b.percentage || 0).toFixed(2)}%</td>
        </tr>
      `
      )
      .join('')}
    </tbody>
  </table>

  <!-- Ventas por Producto -->
  <h2>Ventas por Producto</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Producto</th>
        <th class="text-right">Unidades Vendidas</th>
        <th class="text-right">Total Acumulado</th>
        <th class="text-right">% del Total</th>
      </tr>
    </thead>
    <tbody>
      ${(data.salesByProduct || [])
      .map(
        (p) => `
        <tr>
          <td>${p.product_id}</td>
          <td><strong>${p.product}</strong></td>
          <td class="text-right">${p.quantity_sold} uds</td>
          <td class="text-right">${formatPEN(p.total_sales)}</td>
          <td class="text-right">${Number(p.percentage || 0).toFixed(2)}%</td>
        </tr>
      `
      )
      .join('')}
    </tbody>
  </table>

  <!-- Cumplimiento de Metas -->
  <h2>Cumplimiento de Metas</h2>
  <table>
    <thead>
      <tr>
        <th>Sucursal</th>
        <th>Meta / Objetivo</th>
        <th class="text-right">Meta (PEN)</th>
        <th class="text-right">Venta Actual</th>
        <th class="text-right">% Cumplimiento</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${(data.targetCompliance || [])
      .map(
        (t) => `
        <tr>
          <td>${t.branch}</td>
          <td>${t.target}</td>
          <td class="text-right">${formatPEN(t.target_value)}</td>
          <td class="text-right">${formatPEN(t.sales)}</td>
          <td class="text-right"><strong>${t.compliance_percentage}%</strong></td>
          <td>
            <span class="tag ${t.compliance_percentage >= 80 ? 'tag-green' : t.compliance_percentage >= 50 ? 'tag-blue' : 'tag-amber'}">
              ${t.status || (t.compliance_percentage >= 80 ? 'Cumplida' : 'En progreso')}
            </span>
          </td>
        </tr>
      `
      )
      .join('')}
    </tbody>
  </table>

  <!-- Inventario y Rotación -->
  <h2>Inventario y Rotación</h2>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Sucursal</th>
        <th class="text-right">Stock</th>
        <th class="text-right">Vendido</th>
        <th class="text-right">Índice Rotación</th>
        <th>Estado</th>
        <th>Velocidad</th>
      </tr>
    </thead>
    <tbody>
      ${(data.inventoryRotation || [])
      .map(
        (i) => `
        <tr>
          <td><strong>${i.product}</strong></td>
          <td>${i.branch}</td>
          <td class="text-right">${i.quantity}</td>
          <td class="text-right">${i.quantity_sold}</td>
          <td class="text-right">${Number(i.rotation).toFixed(2)}</td>
          <td><span class="tag ${i.status === 'Normal' ? 'tag-green' : 'tag-amber'}">${i.status}</span></td>
          <td>${i.rotation_speed || 'Normal'}</td>
        </tr>
      `
      )
      .join('')}
    </tbody>
  </table>

  <!-- Actividad Reciente / Auditoría (Fase 6) -->
  <h2>Actividad Reciente y Auditoría (Fase 6)</h2>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Usuario</th>
        <th>Acción</th>
        <th>Módulo</th>
        <th>IP</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${(data.recentActivity || []).slice(0, 8)
      .map(
        (a) => `
        <tr>
          <td>${new Date(a.created_at).toLocaleString('es-PE')}</td>
          <td><strong>${a.username || 'Sistema'}</strong></td>
          <td><code>${a.action}</code></td>
          <td>${a.module}</td>
          <td>${a.ip_address}</td>
          <td><span class="tag ${a.status === 'SUCCESS' ? 'tag-green' : 'tag-amber'}">${a.status}</span></td>
        </tr>
      `
      )
      .join('')}
    </tbody>
  </table>

  <div class="footer">
    <span>MatrixFlow Enterprise v1.0 · Sistema de Gestión Empresarial y Motor Matemático</span>
    <span>Página 1 de 1</span>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

