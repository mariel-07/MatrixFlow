import io
import csv
from fastapi import APIRouter, Depends, Query, Response

from app.schemas.report import ReportResponse
from app.services.report_service import get_reports
from app.core.security import require_roles


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/", response_model=ReportResponse)
def get_all(
    current_user=Depends(
        require_roles(
            "Administrador",
            "Analista",
            "Consulta",
        )
    ),
):
    return get_reports()


@router.get("/export")
def export_reports(
    format: str = Query("csv", description="Formato de exportación: csv o json"),
    section: str = Query("all", description="Sección a exportar o 'all'"),
    current_user=Depends(
        require_roles(
            "Administrador",
            "Analista",
            "Consulta",
        )
    ),
):
    report_data = get_reports()
    sections = report_data.data

    if format == "json":
        if section != "all":
            filtered = [s for s in sections if s.get("module") == section]
            return {"report_type": f"export_{section}", "data": filtered}
        return {"report_type": "export_all", "data": sections}

    # CSV Export
    output = io.StringIO()
    # Add UTF-8 BOM for Excel
    output.write("\ufeff")
    writer = csv.writer(output)

    if section == "sales_by_branch" or section == "all":
        branch_sec = next((s for s in sections if s.get("module") == "sales_by_branch"), None)
        writer.writerow(["=== REPORTE DE VENTAS POR SUCURSAL ==="])
        writer.writerow(["ID Sucursal", "Sucursal", "Total Ventas (PEN)", "N° Ventas", "% del Total"])
        if branch_sec and "data" in branch_sec:
            for b in branch_sec["data"]:
                writer.writerow([
                    b.get("branch_id"),
                    b.get("branch"),
                    f"{b.get('total_sales', 0):.2f}",
                    b.get("sales_count", 0),
                    f"{b.get('percentage', 0):.2f}%"
                ])
        writer.writerow([])

    if section == "sales_by_product" or section == "all":
        prod_sec = next((s for s in sections if s.get("module") == "sales_by_product"), None)
        writer.writerow(["=== REPORTE DE VENTAS POR PRODUCTO ==="])
        writer.writerow(["ID Producto", "Producto", "Total Ventas (PEN)", "Unidades Vendidas", "% del Total"])
        if prod_sec and "data" in prod_sec:
            for p in prod_sec["data"]:
                writer.writerow([
                    p.get("product_id"),
                    p.get("product"),
                    f"{p.get('total_sales', 0):.2f}",
                    p.get("quantity_sold", 0),
                    f"{p.get('percentage', 0):.2f}%"
                ])
        writer.writerow([])

    if section == "target_compliance" or section == "all":
        target_sec = next((s for s in sections if s.get("module") == "target_compliance"), None)
        writer.writerow(["=== CUMPLIMIENTO DE METAS ==="])
        writer.writerow(["ID Meta", "Sucursal", "Meta", "Valor Meta (PEN)", "Ventas Reales (PEN)", "% Cumplimiento", "Estado"])
        if target_sec and "data" in target_sec:
            for t in target_sec["data"]:
                writer.writerow([
                    t.get("target_id"),
                    t.get("branch"),
                    t.get("target"),
                    f"{t.get('target_value', 0):.2f}",
                    f"{t.get('sales', 0):.2f}",
                    f"{t.get('compliance_percentage', 0):.2f}%",
                    t.get("status", "")
                ])
        writer.writerow([])

    if section == "inventory_rotation" or section == "all":
        inv_sec = next((s for s in sections if s.get("module") == "inventory_rotation"), None)
        writer.writerow(["=== INVENTARIO Y ROTACIÓN ==="])
        writer.writerow(["ID Inventario", "Producto", "Sucursal", "Stock Actual", "Unidades Vendidas", "Índice Rotación", "Estado Stock", "Velocidad"])
        if inv_sec and "data" in inv_sec:
            for i in inv_sec["data"]:
                writer.writerow([
                    i.get("inventory_id"),
                    i.get("product"),
                    i.get("branch"),
                    i.get("quantity", 0),
                    i.get("quantity_sold", 0),
                    f"{i.get('rotation', 0):.2f}",
                    i.get("status", ""),
                    i.get("rotation_speed", "")
                ])
        writer.writerow([])

    if section == "operations" or section == "all":
        op_sec = next((s for s in sections if s.get("module") == "operations"), None)
        writer.writerow(["=== RESULTADOS DE OPERACIONES MATEMÁTICAS ==="])
        writer.writerow(["ID Operación", "Tipo de Operación", "Estado", "Resultado", "Fecha Creación"])
        if op_sec and "data" in op_sec:
            for op in op_sec["data"]:
                writer.writerow([
                    op.get("id"),
                    op.get("operation_type"),
                    op.get("status"),
                    str(op.get("result")),
                    op.get("created_at")
                ])
        writer.writerow([])

    if section == "recent_activity" or section == "all":
        act_sec = next((s for s in sections if s.get("module") == "recent_activity"), None)
        writer.writerow(["=== ACTIVIDAD RECIENTE Y AUDITORÍA ==="])
        writer.writerow(["ID Auditoría", "Usuario", "Acción", "Módulo", "Dirección IP", "Estado", "Resultado", "Fecha"])
        if act_sec and "data" in act_sec:
            for a in act_sec["data"]:
                writer.writerow([
                    a.get("id"),
                    a.get("username"),
                    a.get("action"),
                    a.get("module"),
                    a.get("ip_address"),
                    a.get("status"),
                    a.get("result"),
                    a.get("created_at")
                ])
        writer.writerow([])

    csv_data = output.getvalue()
    output.close()

    filename = f"reporte_matrixflow_{section}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8",
        },
    )
