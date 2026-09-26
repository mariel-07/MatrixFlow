import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Eye,
  Grid3X3,
  Package,
  RefreshCw,
  Save,
  ShoppingCart,
  Target,
  Activity,
  Trash2,
  X,
} from "lucide-react";

import api from "../services/api";
import PageHeader from "../components/common/PageHeader";

/* ============================================================
   TIPOS
   ============================================================ */

interface Matrix {
  id: number;
  name: string;
  description: string;
  rows: number;
  columns: number;
  values: number[][];
  createdAt?: string;
}

interface MatrixApiResponse {
  id: number;
  name: string;
  description?: string | null;
  rows?: number;
  columns?: number;
  values?: number[][];
  created_at?: string | null;
  createdAt?: string | null;
}

interface Branch {
  id: string | number;
  name: string;
}

interface Product {
  id: string | number;
  name: string;
}

interface SaleDetail {
  product_id?: string | number | null;
  producto_id?: string | number | null;

  product_name?: string | null;
  producto_nombre?: string | null;

  product?: {
    id?: string | number;
    name?: string;
    nombre?: string;
  } | null;

  quantity?: number | string | null;
  cantidad?: number | string | null;

  unit_price?: number | string | null;
  precio_unitario?: number | string | null;
  price?: number | string | null;
  precio?: number | string | null;

  subtotal?: number | string | null;
  importe?: number | string | null;
  total?: number | string | null;
}

interface Sale {
  id?: string | number;

  branch_id?: string | number | null;
  sucursal_id?: string | number | null;

  branch_name?: string | null;
  sucursal_nombre?: string | null;

  branch?: {
    id?: string | number;
    name?: string;
    nombre?: string;
  } | string | null;

  total?: number | string | null;
  importe_total?: number | string | null;

  details?: SaleDetail[] | null;
  sale_details?: SaleDetail[] | null;
  items?: SaleDetail[] | null;

  product_id?: string | number | null;
  producto_id?: string | number | null;

  product_name?: string | null;
  producto_nombre?: string | null;

  quantity?: number | string | null;
  cantidad?: number | string | null;

  unit_price?: number | string | null;
  precio_unitario?: number | string | null;
  price?: number | string | null;
  precio?: number | string | null;

  subtotal?: number | string | null;
}

interface InventoryRecord {
  id?: string | number;

  branch_id?: string | number | null;
  sucursal_id?: string | number | null;

  branch_name?: string | null;
  sucursal_nombre?: string | null;

  branch?: {
    id?: string | number;
    name?: string;
    nombre?: string;
  } | string | null;

  product_id?: string | number | null;
  producto_id?: string | number | null;

  product_name?: string | null;
  producto_nombre?: string | null;

  product?: {
    id?: string | number;
    name?: string;
    nombre?: string;
  } | string | null;

  quantity?: number | string | null;
  cantidad?: number | string | null;

  stock?: number | string | null;
  stock_quantity?: number | string | null;
}

/* ============================================================
   TIPOS DE REPORTES
   ============================================================ */

interface TargetItem {
  target_id: number;
  branch_id: number;
  branch: string;
  target: string;
  target_value: number;
  sales: number;
  compliance_percentage: number;
  status?: string;
}

interface ProcessingIndicators {
  total_operations: number;
  completed_operations: number;
  error_operations: number;
  success_rate: number;
  avg_execution_time_ms: number;
  matrix_operations: number;
  vector_operations: number;
  linear_combinations: number;
  engine_status: string;
  active_modules: number;
  last_processed_at?: string;
}

interface ReportSection {
  module: string;
  data?: any;
}

/* ============================================================
   TIPOS DE MATRIZ
   ============================================================ */

type MatrixSource =
  | "sales"
  | "inventory"
  | "targets"
  | "indicators";

interface BusinessMatrix {
  name: string;
  description: string;

  rowLabels: string[];
  columnLabels: string[];

  values: number[][];

  rowTotals: number[];
  columnTotals: number[];

  grandTotal: number;
}

/* ============================================================
   FUNCIONES AUXILIARES
   ============================================================ */

const unwrapArray = (response: any): any[] => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const numberValue = (
  value: unknown,
  fallback = 0
): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const stringValue = (
  value: unknown,
  fallback = ""
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value).trim();
};

const normalizeMatrix = (
  matrix: MatrixApiResponse
): Matrix => {
  const values = Array.isArray(matrix.values)
    ? matrix.values.map((row) =>
        Array.isArray(row)
          ? row.map((value) =>
              numberValue(value)
            )
          : []
      )
    : [];

  const rows =
    matrix.rows ??
    values.length;

  const columns =
    matrix.columns ??
    (values.length > 0
      ? values[0].length
      : 0);

  return {
    id: Number(matrix.id),
    name: matrix.name,
    description:
      matrix.description ?? "",
    rows,
    columns,
    values,
    createdAt:
      matrix.createdAt ??
      matrix.created_at ??
      undefined,
  };
};

const getBranchId = (
  value: any
): string => {
  if (
    value?.branch_id !== undefined &&
    value?.branch_id !== null
  ) {
    return String(value.branch_id);
  }

  if (
    value?.sucursal_id !== undefined &&
    value?.sucursal_id !== null
  ) {
    return String(value.sucursal_id);
  }

  if (
    value?.branch &&
    typeof value.branch === "object" &&
    value.branch.id !== undefined
  ) {
    return String(value.branch.id);
  }

  return "";
};

const getBranchName = (
  value: any
): string => {
  if (value?.branch_name) {
    return String(value.branch_name);
  }

  if (value?.sucursal_nombre) {
    return String(value.sucursal_nombre);
  }

  if (
    value?.branch &&
    typeof value.branch === "object"
  ) {
    return (
      value.branch.name ??
      value.branch.nombre ??
      ""
    );
  }

  if (
    typeof value?.branch === "string"
  ) {
    return value.branch;
  }

  return "";
};

const getProductId = (
  value: any
): string => {
  if (
    value?.product_id !== undefined &&
    value?.product_id !== null
  ) {
    return String(value.product_id);
  }

  if (
    value?.producto_id !== undefined &&
    value?.producto_id !== null
  ) {
    return String(value.producto_id);
  }

  if (
    value?.product &&
    typeof value.product === "object" &&
    value.product.id !== undefined
  ) {
    return String(value.product.id);
  }

  return "";
};

const getProductName = (
  value: any
): string => {
  if (value?.product_name) {
    return String(value.product_name);
  }

  if (value?.producto_nombre) {
    return String(value.producto_nombre);
  }

  if (
    value?.product &&
    typeof value.product === "object"
  ) {
    return (
      value.product.name ??
      value.product.nombre ??
      ""
    );
  }

  if (
    typeof value?.product === "string"
  ) {
    return value.product;
  }

  return "";
};

const getQuantity = (
  value: any
): number => {
  return numberValue(
    value?.quantity ??
      value?.cantidad ??
      value?.stock ??
      value?.stock_quantity
  );
};

const getUnitPrice = (
  value: any
): number => {
  return numberValue(
    value?.unit_price ??
      value?.precio_unitario ??
      value?.price ??
      value?.precio
  );
};

const getSubtotal = (
  value: any
): number => {
  const direct =
    value?.subtotal ??
    value?.importe;

  if (
    direct !== undefined &&
    direct !== null
  ) {
    return numberValue(direct);
  }

  if (
    value?.total !== undefined &&
    value?.total !== null
  ) {
    return numberValue(value.total);
  }

  return (
    getQuantity(value) *
    getUnitPrice(value)
  );
};

const formatMoney = (
  value: number
): string => {
  return new Intl.NumberFormat(
    "es-PE",
    {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }
  ).format(value);
};

const formatNumber = (
  value: number
): string => {
  return new Intl.NumberFormat(
    "es-PE",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);
};

/* ============================================================
   COMPONENTE
   ============================================================ */

export default function Matrices() {
  /* ==========================================================
     MATRICES GUARDADAS
     ========================================================== */

  const [
    matrixList,
    setMatrixList,
  ] = useState<Matrix[]>([]);

  const [
    selectedMatrix,
    setSelectedMatrix,
  ] = useState<Matrix | null>(null);

  /* ==========================================================
     DATOS DEL NEGOCIO
     ========================================================== */

  const [
    branches,
    setBranches,
  ] = useState<Branch[]>([]);

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    sales,
    setSales,
  ] = useState<Sale[]>([]);

  const [
    inventory,
    setInventory,
  ] = useState<InventoryRecord[]>([]);

  /* ==========================================================
     DATOS DE REPORTES
     ========================================================== */

  const [
    targetItems,
    setTargetItems,
  ] = useState<TargetItem[]>([]);

  const [
    processingIndicators,
    setProcessingIndicators,
  ] = useState<ProcessingIndicators | null>(
    null
  );

  /* ==========================================================
     ESTADO
     ========================================================== */

  const [
    source,
    setSource,
  ] = useState<MatrixSource>("sales");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<number | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ==========================================================
     CARGAR DATOS
     ========================================================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const results =
        await Promise.allSettled([
          api.get(
            "/api/v1/branches/"
          ),
          api.get(
            "/api/v1/products/"
          ),
          api.get(
            "/api/v1/sales/"
          ),
          api.get(
            "/api/v1/inventory/"
          ),
          api.get(
            "/api/v1/matrices/"
          ),
          api.get(
            "/api/v1/reports/"
          ),
        ]);

      const [
        branchesResponse,
        productsResponse,
        salesResponse,
        inventoryResponse,
        matricesResponse,
        reportsResponse,
      ] = results;

      /* ========================================================
         SUCURSALES
         ======================================================== */

      if (
        branchesResponse.status ===
        "fulfilled"
      ) {
        const data =
          unwrapArray(
            branchesResponse.value
          );

        setBranches(
          data
            .map((item: any) => ({
              id:
                item.id ??
                item.branch_id ??
                item.sucursal_id,
              name:
                item.name ??
                item.nombre ??
                item.branch_name ??
                item.sucursal_nombre ??
                `Sucursal ${
                  item.id ?? ""
                }`,
            }))
            .filter(
              (item) =>
                item.id !==
                undefined
            )
        );
      }

      /* ========================================================
         PRODUCTOS
         ======================================================== */

      if (
        productsResponse.status ===
        "fulfilled"
      ) {
        const data =
          unwrapArray(
            productsResponse.value
          );

        setProducts(
          data
            .map((item: any) => ({
              id:
                item.id ??
                item.product_id ??
                item.producto_id,
              name:
                item.name ??
                item.nombre ??
                item.product_name ??
                item.producto_nombre ??
                `Producto ${
                  item.id ?? ""
                }`,
            }))
            .filter(
              (item) =>
                item.id !==
                undefined
            )
        );
      }

      /* ========================================================
         VENTAS
         ======================================================== */

      if (
        salesResponse.status ===
        "fulfilled"
      ) {
        setSales(
          unwrapArray(
            salesResponse.value
          )
        );
      }

      /* ========================================================
         INVENTARIO
         ======================================================== */

      if (
        inventoryResponse.status ===
        "fulfilled"
      ) {
        setInventory(
          unwrapArray(
            inventoryResponse.value
          )
        );
      }

      /* ========================================================
         MATRICES GUARDADAS
         ======================================================== */

      if (
        matricesResponse.status ===
        "fulfilled"
      ) {
        setMatrixList(
          unwrapArray(
            matricesResponse.value
          ).map(
            normalizeMatrix
          )
        );
      }

      /* ========================================================
         REPORTES: METAS + INDICADORES
         ======================================================== */

      if (
        reportsResponse.status ===
        "fulfilled"
      ) {
        const reportData =
          reportsResponse.value?.data;

        const sections: ReportSection[] =
          Array.isArray(
            reportData
          )
            ? reportData
            : Array.isArray(
                reportData?.data
              )
            ? reportData.data
            : [];

        /* ----------------------------------------------
           METAS
           ---------------------------------------------- */

        const targetSection =
          sections.find(
            (section) =>
              section?.module ===
              "target_compliance"
          );

        if (targetSection) {
          const rawTargets =
            Array.isArray(
              targetSection.data
            )
              ? targetSection.data
              : Array.isArray(
                  targetSection.data?.items
                )
              ? targetSection.data.items
              : [];

          setTargetItems(
            rawTargets.map(
              (item: any) => ({
                target_id:
                  numberValue(
                    item.target_id ??
                      item.id
                  ),

                branch_id:
                  numberValue(
                    item.branch_id ??
                      item.sucursal_id
                  ),

                branch:
                  stringValue(
                    item.branch ??
                      item.branch_name ??
                      item.sucursal_nombre,
                    "Sucursal"
                  ),

                target:
                  stringValue(
                    item.target ??
                      item.name,
                    "Meta"
                  ),

                target_value:
                  numberValue(
                    item.target_value ??
                      item.value ??
                      item.meta
                  ),

                sales:
                  numberValue(
                    item.sales ??
                      item.ventas
                  ),

                compliance_percentage:
                  numberValue(
                    item.compliance_percentage ??
                      item.compliance ??
                      item.cumplimiento
                  ),

                status:
                  stringValue(
                    item.status
                  ),
              })
            )
          );
        } else {
          setTargetItems([]);
        }

        /* ----------------------------------------------
           INDICADORES DEL MOTOR
           ---------------------------------------------- */

        const indicatorSection =
          sections.find(
            (section) =>
              section?.module ===
              "processing_indicators"
          );

        if (indicatorSection) {
          const data =
            indicatorSection.data ??
            {};

          setProcessingIndicators(
            {
              total_operations:
                numberValue(
                  data.total_operations
                ),

              completed_operations:
                numberValue(
                  data.completed_operations
                ),

              error_operations:
                numberValue(
                  data.error_operations
                ),

              success_rate:
                numberValue(
                  data.success_rate
                ),

              avg_execution_time_ms:
                numberValue(
                  data.avg_execution_time_ms
                ),

              matrix_operations:
                numberValue(
                  data.matrix_operations
                ),

              vector_operations:
                numberValue(
                  data.vector_operations
                ),

              linear_combinations:
                numberValue(
                  data.linear_combinations
                ),

              engine_status:
                stringValue(
                  data.engine_status,
                  "No disponible"
                ),

              active_modules:
                numberValue(
                  data.active_modules
                ),

              last_processed_at:
                data.last_processed_at,
            }
          );
        } else {
          setProcessingIndicators(
            null
          );
        }
      }

      const failedRequests =
        results.filter(
          (result) =>
            result.status ===
            "rejected"
        );

      if (
        failedRequests.length ===
        results.length
      ) {
        setErrorMessage(
          "No se pudo conectar con el backend de MatrixFlow."
        );
      }
    } catch (error: any) {
      console.error(
        "Error cargando datos:",
        error
      );

      setErrorMessage(
        error?.response?.data
          ?.detail ??
          "No se pudieron cargar los datos de MatrixFlow."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ==========================================================
     ACTUALIZAR
     ========================================================== */

  const refreshData = async () => {
    try {
      setRefreshing(true);
      setErrorMessage("");
      setSuccessMessage("");

      await loadData();

      setSuccessMessage(
        "Datos actualizados correctamente."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } finally {
      setRefreshing(false);
    }
  };

  /* ==========================================================
     OBTENER SUCURSALES REALES
     ========================================================== */

  const businessBranches =
    useMemo(() => {
      const map =
        new Map<
          string,
          Branch
        >();

      branches.forEach(
        (branch) => {
          map.set(
            String(branch.id),
            branch
          );
        }
      );

      const addBranch = (
        id: string,
        name: string
      ) => {
        if (!id && !name) {
          return;
        }

        const key =
          id || name;

        if (
          !map.has(key)
        ) {
          map.set(key, {
            id: key,
            name:
              name ||
              `Sucursal ${key}`,
          });
        }
      };

      sales.forEach(
        (sale) => {
          addBranch(
            getBranchId(
              sale
            ),
            getBranchName(
              sale
            )
          );
        }
      );

      inventory.forEach(
        (item) => {
          addBranch(
            getBranchId(
              item
            ),
            getBranchName(
              item
            )
          );
        }
      );

      targetItems.forEach(
        (target) => {
          addBranch(
            String(
              target.branch_id
            ),
            target.branch
          );
        }
      );

      return Array.from(
        map.values()
      );
    }, [
      branches,
      sales,
      inventory,
      targetItems,
    ]);

  /* ==========================================================
     OBTENER PRODUCTOS REALES
     ========================================================== */

  const businessProducts =
    useMemo(() => {
      const map =
        new Map<
          string,
          Product
        >();

      products.forEach(
        (product) => {
          map.set(
            String(product.id),
            product
          );
        }
      );

      const addProduct = (
        id: string,
        name: string
      ) => {
        if (!id && !name) {
          return;
        }

        const key =
          id || name;

        if (
          !map.has(key)
        ) {
          map.set(key, {
            id: key,
            name:
              name ||
              `Producto ${key}`,
          });
        }
      };

      sales.forEach(
        (sale) => {
          const details =
            sale.details ??
            sale.sale_details ??
            sale.items;

          if (
            Array.isArray(
              details
            )
          ) {
            details.forEach(
              (detail) => {
                addProduct(
                  getProductId(
                    detail
                  ),
                  getProductName(
                    detail
                  )
                );
              }
            );
          } else {
            addProduct(
              getProductId(
                sale
              ),
              getProductName(
                sale
              )
            );
          }
        }
      );

      inventory.forEach(
        (item) => {
          addProduct(
            getProductId(
              item
            ),
            getProductName(
              item
            )
          );
        }
      );

      return Array.from(
        map.values()
      );
    }, [
      products,
      sales,
      inventory,
    ]);

  /* ==========================================================
     CONSTRUIR MATRIZ DE VENTAS

     FILAS    = SUCURSALES
     COLUMNAS = PRODUCTOS
     VALOR    = INGRESO
     ========================================================== */

  const salesMatrix =
    useMemo<BusinessMatrix>(
      () => {
        const branchIndex =
          new Map<
            string,
            number
          >();

        const productIndex =
          new Map<
            string,
            number
          >();

        businessBranches.forEach(
          (branch, index) => {
            branchIndex.set(
              String(
                branch.id
              ),
              index
            );
          }
        );

        businessProducts.forEach(
          (product, index) => {
            productIndex.set(
              String(
                product.id
              ),
              index
            );
          }
        );

        const values =
          businessBranches.map(
            () =>
              Array(
                businessProducts.length
              ).fill(0)
          );

        sales.forEach(
          (sale) => {
            const branchId =
              getBranchId(
                sale
              );

            const branchName =
              getBranchName(
                sale
              );

            let branchRow =
              branchIndex.get(
                branchId
              );

            if (
              branchRow ===
                undefined &&
              branchName
            ) {
              branchRow =
                businessBranches.findIndex(
                  (branch) =>
                    branch.name
                      .toLowerCase() ===
                    branchName.toLowerCase()
                );
            }

            if (
              branchRow ===
                undefined ||
              branchRow < 0
            ) {
              return;
            }

            const details =
              sale.details ??
              sale.sale_details ??
              sale.items;

            if (
              Array.isArray(
                details
              )
            ) {
              details.forEach(
                (detail) => {
                  const productId =
                    getProductId(
                      detail
                    );

                  const productName =
                    getProductName(
                      detail
                    );

                  let productColumn =
                    productIndex.get(
                      productId
                    );

                  if (
                    productColumn ===
                      undefined &&
                    productName
                  ) {
                    productColumn =
                      businessProducts.findIndex(
                        (product) =>
                          product.name
                            .toLowerCase() ===
                          productName.toLowerCase()
                      );
                  }

                  if (
                    productColumn ===
                      undefined ||
                    productColumn < 0
                  ) {
                    return;
                  }

                  values[
                    branchRow!
                  ][
                    productColumn
                  ] += getSubtotal(
                    detail
                  );
                }
              );

              return;
            }

            const productId =
              getProductId(
                sale
              );

            const productName =
              getProductName(
                sale
              );

            let productColumn =
              productIndex.get(
                productId
              );

            if (
              productColumn ===
                undefined &&
              productName
            ) {
              productColumn =
                businessProducts.findIndex(
                  (product) =>
                    product.name
                      .toLowerCase() ===
                    productName.toLowerCase()
                );
            }

            if (
              productColumn !==
                undefined &&
              productColumn >= 0
            ) {
              values[
                branchRow
              ][
                productColumn
              ] += getSubtotal(
                sale
              );
            }
          }
        );

        const rowTotals =
          values.map(
            (row) =>
              row.reduce(
                (
                  sum,
                  value
                ) =>
                  sum + value,
                0
              )
          );

        const columnTotals =
          businessProducts.map(
            (_, columnIndex) =>
              values.reduce(
                (
                  sum,
                  row
                ) =>
                  sum +
                  (row[
                    columnIndex
                  ] ?? 0),
                0
              )
          );

        const grandTotal =
          rowTotals.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );

        return {
          name:
            "Ventas por sucursal y producto",

          description:
            "Ingresos obtenidos por cada producto en cada sucursal.",

          rowLabels:
            businessBranches.map(
              (branch) =>
                branch.name
            ),

          columnLabels:
            businessProducts.map(
              (product) =>
                product.name
            ),

          values,

          rowTotals,

          columnTotals,

          grandTotal,
        };
      },
      [
        businessBranches,
        businessProducts,
        sales,
      ]
    );

  /* ==========================================================
     CONSTRUIR MATRIZ DE INVENTARIO

     FILAS    = SUCURSALES
     COLUMNAS = PRODUCTOS
     VALOR    = UNIDADES
     ========================================================== */

  const inventoryMatrix =
    useMemo<BusinessMatrix>(
      () => {
        const branchIndex =
          new Map<
            string,
            number
          >();

        const productIndex =
          new Map<
            string,
            number
          >();

        businessBranches.forEach(
          (branch, index) => {
            branchIndex.set(
              String(
                branch.id
              ),
              index
            );
          }
        );

        businessProducts.forEach(
          (product, index) => {
            productIndex.set(
              String(
                product.id
              ),
              index
            );
          }
        );

        const values =
          businessBranches.map(
            () =>
              Array(
                businessProducts.length
              ).fill(0)
          );

        inventory.forEach(
          (item) => {
            const branchId =
              getBranchId(
                item
              );

            const branchName =
              getBranchName(
                item
              );

            let branchRow =
              branchIndex.get(
                branchId
              );

            if (
              branchRow ===
                undefined &&
              branchName
            ) {
              branchRow =
                businessBranches.findIndex(
                  (branch) =>
                    branch.name
                      .toLowerCase() ===
                    branchName.toLowerCase()
                );
            }

            if (
              branchRow ===
                undefined ||
              branchRow < 0
            ) {
              return;
            }

            const productId =
              getProductId(
                item
              );

            const productName =
              getProductName(
                item
              );

            let productColumn =
              productIndex.get(
                productId
              );

            if (
              productColumn ===
                undefined &&
              productName
            ) {
              productColumn =
                businessProducts.findIndex(
                  (product) =>
                    product.name
                      .toLowerCase() ===
                    productName.toLowerCase()
                );
            }

            if (
              productColumn ===
                undefined ||
              productColumn < 0
            ) {
              return;
            }

            values[
              branchRow
            ][
              productColumn
            ] += getQuantity(
              item
            );
          }
        );

        const rowTotals =
          values.map(
            (row) =>
              row.reduce(
                (
                  sum,
                  value
                ) =>
                  sum + value,
                0
              )
          );

        const columnTotals =
          businessProducts.map(
            (_, columnIndex) =>
              values.reduce(
                (
                  sum,
                  row
                ) =>
                  sum +
                  (row[
                    columnIndex
                  ] ?? 0),
                0
              )
          );

        const grandTotal =
          rowTotals.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );

        return {
          name:
            "Inventario por sucursal y producto",

          description:
            "Unidades disponibles de cada producto en cada sucursal.",

          rowLabels:
            businessBranches.map(
              (branch) =>
                branch.name
            ),

          columnLabels:
            businessProducts.map(
              (product) =>
                product.name
            ),

          values,

          rowTotals,

          columnTotals,

          grandTotal,
        };
      },
      [
        businessBranches,
        businessProducts,
        inventory,
      ]
    );

  /* ==========================================================
     CONSTRUIR MATRIZ DE METAS

     FILAS    = SUCURSALES
     COLUMNAS = META / VENTAS / DIFERENCIA

     Esta información proviene del reporte real.
     No se inventan metas por producto.
     ========================================================== */

  const targetsMatrix =
    useMemo<BusinessMatrix>(
      () => {
        const rows =
          targetItems.map(
            (item) => {
              const difference =
                item.sales -
                item.target_value;

              return [
                item.target_value,
                item.sales,
                difference,
              ];
            }
          );

        const rowTotals =
          rows.map(
            (row) =>
              row.reduce(
                (
                  sum,
                  value
                ) =>
                  sum + value,
                0
              )
          );

        const columnTotals =
          [0, 1, 2].map(
            (columnIndex) =>
              rows.reduce(
                (
                  sum,
                  row
                ) =>
                  sum +
                  (row[
                    columnIndex
                  ] ?? 0),
                0
              )
          );

        const grandTotal =
          rowTotals.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );

        return {
          name:
            "Metas y cumplimiento por sucursal",

          description:
            "Comparación entre la meta registrada, las ventas reales y la diferencia por sucursal.",

          rowLabels:
            targetItems.map(
              (item) =>
                item.branch
            ),

          columnLabels: [
            "Meta",
            "Ventas",
            "Diferencia",
          ],

          values: rows,

          rowTotals,

          columnTotals,

          grandTotal,
        };
      },
      [targetItems]
    );

  /* ==========================================================
     CONSTRUIR MATRIZ DE INDICADORES

     Son indicadores reales entregados por el módulo
     de reportes/procesamiento de MatrixFlow.
     ========================================================== */

  const indicatorsMatrix =
    useMemo<BusinessMatrix>(
      () => {
        if (
          !processingIndicators
        ) {
          return {
            name:
              "Indicadores del motor MatrixFlow",

            description:
              "Indicadores registrados por el motor de procesamiento.",

            rowLabels: [],

            columnLabels: [
              "Valor",
            ],

            values: [],

            rowTotals: [],

            columnTotals: [0],

            grandTotal: 0,
          };
        }

        const rows: Array<
          [string, number]
        > = [
          [
            "Operaciones totales",
            processingIndicators.total_operations,
          ],
          [
            "Operaciones completadas",
            processingIndicators.completed_operations,
          ],
          [
            "Operaciones con error",
            processingIndicators.error_operations,
          ],
          [
            "Tasa de éxito (%)",
            processingIndicators.success_rate,
          ],
          [
            "Tiempo promedio (ms)",
            processingIndicators.avg_execution_time_ms,
          ],
          [
            "Operaciones de matrices",
            processingIndicators.matrix_operations,
          ],
          [
            "Operaciones de vectores",
            processingIndicators.vector_operations,
          ],
          [
            "Combinaciones lineales",
            processingIndicators.linear_combinations,
          ],
          [
            "Módulos activos",
            processingIndicators.active_modules,
          ],
        ];

        const values =
          rows.map(
            (row) => [
              row[1],
            ]
          );

        const rowTotals =
          values.map(
            (row) =>
              row[0] ?? 0
          );

        const columnTotals =
          [
            values.reduce(
              (
                sum,
                row
              ) =>
                sum +
                (row[0] ?? 0),
              0
            ),
          ];

        const grandTotal =
          columnTotals[0] ?? 0;

        return {
          name:
            "Indicadores del motor MatrixFlow",

          description:
            "Indicadores disponibles del procesamiento matemático registrado por MatrixFlow.",

          rowLabels:
            rows.map(
              (row) =>
                row[0]
            ),

          columnLabels: [
            "Valor",
          ],

          values,

          rowTotals,

          columnTotals,

          grandTotal,
        };
      },
      [processingIndicators]
    );

  /* ==========================================================
     MATRIZ ACTIVA
     ========================================================== */

  const activeMatrix =
    source === "sales"
      ? salesMatrix
      : source === "inventory"
      ? inventoryMatrix
      : source === "targets"
      ? targetsMatrix
      : indicatorsMatrix;

  /* ==========================================================
     ESTADÍSTICAS
     ========================================================== */

  const totalMatrices =
    matrixList.length;

  const totalElements =
    useMemo(() => {
      return matrixList.reduce(
        (
          total,
          matrix
        ) =>
          total +
          matrix.rows *
            matrix.columns,
        0
      );
    }, [matrixList]);

  /* ==========================================================
     CONFIGURACIÓN VISUAL SEGÚN FUENTE
     ========================================================== */

  const sourceTitle =
    source === "sales"
      ? "Ventas"
      : source === "inventory"
      ? "Inventario"
      : source === "targets"
      ? "Metas"
      : "Indicadores";

  const sourceDescription =
    source === "sales"
      ? "Ingresos de ventas por sucursal y producto."
      : source === "inventory"
      ? "Unidades disponibles por sucursal y producto."
      : source === "targets"
      ? "Metas registradas y comparación con las ventas reales."
      : "Indicadores disponibles del motor de procesamiento.";

  const sourceUsesMoney =
    source === "sales" ||
    source === "targets";

  /* ==========================================================
     GUARDAR MATRIZ GENERADA
     ========================================================== */

  const saveBusinessMatrix =
    async () => {
      if (
        activeMatrix.values
          .length === 0 ||
        activeMatrix.columnLabels
          .length === 0
      ) {
        setErrorMessage(
          "No existen datos suficientes para generar esta matriz."
        );

        return;
      }

      try {
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        const response =
          await api.post<MatrixApiResponse>(
            "/api/v1/matrices/",
            {
              name:
                activeMatrix.name,

              description:
                activeMatrix.description,

              values:
                activeMatrix.values,
            }
          );

        const savedMatrix =
          normalizeMatrix(
            response.data
          );

        setMatrixList(
          (current) => [
            ...current,
            savedMatrix,
          ]
        );

        setSelectedMatrix(
          savedMatrix
        );

        setSuccessMessage(
          "La matriz se guardó correctamente en la base de datos."
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 3500);
      } catch (error: any) {
        console.error(
          "Error guardando matriz:",
          error
        );

        setErrorMessage(
          error?.response?.data
            ?.detail ??
            "No se pudo guardar la matriz."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==========================================================
     ELIMINAR MATRIZ
     ========================================================== */

  const deleteMatrix =
    async (
      id: number
    ) => {
      const matrix =
        matrixList.find(
          (item) =>
            item.id === id
        );

      const confirmed =
        window.confirm(
          `¿Deseas eliminar la matriz "${matrix?.name ?? ""}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(id);
        setErrorMessage("");
        setSuccessMessage("");

        await api.delete(
          `/api/v1/matrices/${id}`
        );

        setMatrixList(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id
            )
        );

        if (
          selectedMatrix?.id ===
          id
        ) {
          setSelectedMatrix(
            null
          );
        }

        setSuccessMessage(
          "Matriz eliminada correctamente."
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error: any) {
        console.error(
          "Error eliminando matriz:",
          error
        );

        setErrorMessage(
          error?.response?.data
            ?.detail ??
            "No se pudo eliminar la matriz."
        );
      } finally {
        setDeletingId(null);
      }
    };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="space-y-6">

      {/* ======================================================
          CABECERA
          ====================================================== */}

      <PageHeader
        title="Matrices"
        description="Organiza y compara los datos reales de tu empresa en filas y columnas."
        action={
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Actualizando..."
              : "Actualizar datos"}
          </button>
        }
      />

      {/* ======================================================
          MENSAJES
          ====================================================== */}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {errorMessage}
          </span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* ======================================================
          ESTADÍSTICAS
          ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Matrices guardadas
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalMatrices}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Grid3X3
                size={22}
              />
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Elementos guardados
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalElements}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Database
                size={22}
              />
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Datos disponibles
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {businessBranches.length}{" "}
                sucursales ·{" "}
                {businessProducts.length}{" "}
                productos
              </p>
            </div>

            <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
              <Package
                size={22}
              />
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================
          GENERADOR DE MATRIZ
          ====================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Generar matriz con datos reales
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Selecciona el origen de los datos que deseas representar.
                La información se obtiene directamente de MatrixFlow.
              </p>
            </div>

            {/* ==================================================
                SELECTOR DE FUENTES
                ================================================== */}

            <div className="flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1">

              {/* VENTAS */}

              <button
                onClick={() =>
                  setSource(
                    "sales"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  source ===
                  "sales"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShoppingCart
                  size={17}
                />

                Ventas
              </button>

              {/* INVENTARIO */}

              <button
                onClick={() =>
                  setSource(
                    "inventory"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  source ===
                  "inventory"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Package
                  size={17}
                />

                Inventario
              </button>

              {/* METAS */}

              <button
                onClick={() =>
                  setSource(
                    "targets"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  source ===
                  "targets"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Target
                  size={17}
                />

                Metas
              </button>

              {/* INDICADORES */}

              <button
                onClick={() =>
                  setSource(
                    "indicators"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  source ===
                  "indicators"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity
                  size={17}
                />

                Indicadores
              </button>

            </div>

          </div>

        </div>

        {/* ====================================================
            FUENTE ACTIVA
            ==================================================== */}

        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50 p-5 md:grid-cols-3">

          {/* FILAS */}

          <div className="rounded-lg border border-slate-200 bg-white p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filas
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {source ===
              "indicators"
                ? "Indicadores"
                : "Sucursales"}
            </p>

            <p className="mt-1 text-sm text-slate-500">

              {source ===
              "sales" ||
              source ===
              "inventory"
                ? `${businessBranches.length} disponibles`
                : source ===
                  "targets"
                ? `${targetItems.length} sucursales con metas`
                : `${indicatorsMatrix.rowLabels.length} indicadores disponibles`}

            </p>

          </div>

          {/* COLUMNAS */}

          <div className="rounded-lg border border-slate-200 bg-white p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Columnas
            </p>

            <p className="mt-1 font-semibold text-slate-900">

              {source ===
              "sales" ||
              source ===
              "inventory"
                ? "Productos"
                : source ===
                  "targets"
                ? "Meta · Ventas · Diferencia"
                : "Valor"}

            </p>

            <p className="mt-1 text-sm text-slate-500">

              {source ===
              "sales" ||
              source ===
              "inventory"
                ? `${businessProducts.length} disponibles`
                : source ===
                  "targets"
                ? "Datos del reporte de cumplimiento"
                : "Valor registrado"}

            </p>

          </div>

          {/* INFORMACIÓN */}

          <div className="rounded-lg border border-slate-200 bg-white p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Información
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {sourceTitle}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {sourceDescription}
            </p>

          </div>

        </div>

        {/* ====================================================
            MATRIZ
            ==================================================== */}

        <div className="p-5">

          {loading ? (

            <div className="flex min-h-[220px] items-center justify-center">

              <div className="text-center">

                <RefreshCw
                  size={28}
                  className="mx-auto animate-spin text-blue-600"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Cargando datos...
                </p>

              </div>

            </div>

          ) : activeMatrix.values.length ===
              0 ||
            activeMatrix.columnLabels.length ===
              0 ? (

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">

              {source ===
              "targets" ? (
                <Target
                  size={34}
                  className="mx-auto text-slate-400"
                />
              ) : source ===
                "indicators" ? (
                <Activity
                  size={34}
                  className="mx-auto text-slate-400"
                />
              ) : (
                <Database
                  size={34}
                  className="mx-auto text-slate-400"
                />
              )}

              <h3 className="mt-3 font-semibold text-slate-900">
                No hay datos suficientes
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">

                {source ===
                "sales"
                  ? "Registra sucursales, productos y ventas para poder construir la matriz."
                  : source ===
                    "inventory"
                  ? "Registra sucursales, productos e inventario para poder construir la matriz."
                  : source ===
                    "targets"
                  ? "No existen metas disponibles en el reporte de cumplimiento."
                  : "No existen indicadores disponibles en el reporte de procesamiento."}

              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  TÍTULO + GUARDAR
                  ================================================= */}

              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="font-semibold text-slate-900">
                    {activeMatrix.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {activeMatrix.description}
                  </p>

                </div>

                <button
                  onClick={
                    saveBusinessMatrix
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save
                    size={17}
                  />

                  {saving
                    ? "Guardando..."
                    : "Guardar matriz"}
                </button>

              </div>

              {/* =================================================
                  RESUMEN
                  ================================================= */}

              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-lg border border-slate-200 bg-white p-4">

                  <p className="text-xs text-slate-500">
                    Dimensión
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {activeMatrix.values.length}
                    {" × "}
                    {
                      activeMatrix
                        .columnLabels
                        .length
                    }
                  </p>

                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">

                  <p className="text-xs text-slate-500">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">

                    {sourceUsesMoney
                      ? formatMoney(
                          activeMatrix.grandTotal
                        )
                      : formatNumber(
                          activeMatrix.grandTotal
                        )}

                  </p>

                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">

                  <p className="text-xs text-slate-500">
                    Fuente
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {sourceTitle}
                  </p>

                </div>

              </div>

              {/* =================================================
                  TABLA MATRICIAL
                  ================================================= */}

              <div className="overflow-x-auto rounded-xl border border-slate-200">

                <table className="w-full min-w-[850px] border-collapse">

                  <thead>

                    <tr className="bg-slate-100">

                      <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">

                        {source ===
                        "indicators"
                          ? "Indicador"
                          : "Sucursal"}

                      </th>

                      {activeMatrix.columnLabels.map(
                        (
                          column,
                          index
                        ) => (

                          <th
                            key={`${column}-${index}`}
                            className="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600"
                          >
                            {column}
                          </th>

                        )
                      )}

                      <th className="border-b border-l border-slate-200 bg-slate-100 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {activeMatrix.values.map(
                      (
                        row,
                        rowIndex
                      ) => (

                        <tr
                          key={
                            activeMatrix
                              .rowLabels[
                              rowIndex
                            ] ??
                            rowIndex
                          }
                          className="hover:bg-slate-50"
                        >

                          <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900">

                            {
                              activeMatrix
                                .rowLabels[
                                rowIndex
                              ]
                            }

                          </td>

                          {row.map(
                            (
                              value,
                              columnIndex
                            ) => (

                              <td
                                key={
                                  columnIndex
                                }
                                className={`border-b border-slate-200 px-4 py-3 text-right text-sm ${
                                  source ===
                                    "targets" &&
                                  columnIndex ===
                                    2
                                    ? value <
                                      0
                                      ? "font-semibold text-red-600"
                                      : "font-semibold text-emerald-600"
                                    : "text-slate-700"
                                }`}
                              >

                                {source ===
                                "sales"
                                  ? formatMoney(
                                      value
                                    )
                                  : source ===
                                    "targets"
                                  ? formatMoney(
                                      value
                                    )
                                  : source ===
                                    "indicators" &&
                                    activeMatrix
                                      .columnLabels[
                                      columnIndex
                                    ] ===
                                      "Valor"
                                  ? formatNumber(
                                      value
                                    )
                                  : formatNumber(
                                      value
                                    )}

                              </td>

                            )
                          )}

                          <td className="border-b border-l border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm font-bold text-slate-900">

                            {source ===
                            "sales"
                              ? formatMoney(
                                  activeMatrix
                                    .rowTotals[
                                    rowIndex
                                  ]
                                )
                              : source ===
                                "targets"
                              ? formatMoney(
                                  activeMatrix
                                    .rowTotals[
                                    rowIndex
                                  ]
                                )
                              : formatNumber(
                                  activeMatrix
                                    .rowTotals[
                                    rowIndex
                                  ]
                                )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                  <tfoot>

                    <tr className="bg-slate-100">

                      <th className="sticky left-0 z-10 border-r border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                        Total
                      </th>

                      {activeMatrix.columnTotals.map(
                        (
                          total,
                          index
                        ) => (

                          <td
                            key={
                              index
                            }
                            className="border-t border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900"
                          >

                            {source ===
                            "sales"
                              ? formatMoney(
                                  total
                                )
                              : source ===
                                "targets"
                              ? formatMoney(
                                  total
                                )
                              : formatNumber(
                                  total
                                )}

                          </td>

                        )
                      )}

                      <td className="border-l border-t border-slate-300 bg-slate-200 px-4 py-3 text-right text-sm font-bold text-slate-900">

                        {source ===
                        "sales"
                          ? formatMoney(
                              activeMatrix.grandTotal
                            )
                          : source ===
                            "targets"
                          ? formatMoney(
                              activeMatrix.grandTotal
                            )
                          : formatNumber(
                              activeMatrix.grandTotal
                            )}

                      </td>

                    </tr>

                  </tfoot>

                </table>

              </div>

              {/* =================================================
                  INFORMACIÓN DE LA MATRIZ
                  ================================================= */}

              <div className="mt-4 flex items-start gap-3 rounded-lg bg-slate-50 p-4">

                <Database
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <div className="text-sm text-slate-600">

                  <p className="font-medium text-slate-800">
                    Datos utilizados
                  </p>

                  <p className="mt-1">

                    {source ===
                    "sales"
                      ? "Cada fila representa una sucursal, cada columna representa un producto y cada celda contiene los ingresos reales obtenidos."
                      : source ===
                        "inventory"
                      ? "Cada fila representa una sucursal, cada columna representa un producto y cada celda contiene las unidades registradas en inventario."
                      : source ===
                        "targets"
                      ? "La matriz utiliza las metas y ventas reales entregadas por el módulo de reportes. La diferencia se calcula como Ventas − Meta."
                      : "Los valores corresponden a los indicadores reales entregados por el módulo de procesamiento de MatrixFlow."}

                  </p>

                </div>

              </div>

              {/* =================================================
                  INFORMACIÓN ESPECÍFICA DE METAS
                  ================================================= */}

              {source ===
                "targets" &&
                targetItems.length >
                  0 && (

                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">

                    <div className="flex items-start gap-3">

                      <Target
                        size={19}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>

                        <p className="font-medium text-amber-900">
                          Comparación de metas
                        </p>

                        <p className="mt-1 text-sm text-amber-800">
                          La columna
                          {" "}
                          <strong>
                            Diferencia
                          </strong>
                          {" "}
                          representa las ventas reales menos la meta registrada para cada sucursal.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              {/* =================================================
                  INFORMACIÓN ESPECÍFICA DE INDICADORES
                  ================================================= */}

              {source ===
                "indicators" &&
                processingIndicators && (

                  <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4">

                    <div className="flex items-start gap-3">

                      <Activity
                        size={19}
                        className="mt-0.5 shrink-0 text-violet-600"
                      />

                      <div>

                        <p className="font-medium text-violet-900">
                          Indicadores disponibles
                        </p>

                        <p className="mt-1 text-sm text-violet-800">

                          Estado del motor:
                          {" "}
                          <strong>
                            {
                              processingIndicators.engine_status
                            }
                          </strong>

                          {" · "}

                          Módulos activos:
                          {" "}
                          <strong>
                            {
                              processingIndicators.active_modules
                            }
                          </strong>

                        </p>

                      </div>

                    </div>

                  </div>

                )}

            </>

          )}

        </div>

      </section>

      {/* ======================================================
          MATRICES GUARDADAS
          ====================================================== */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-5">

          <h2 className="font-semibold text-slate-900">
            Matrices guardadas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Matrices que ya fueron almacenadas en la base de datos.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[750px]">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Matriz
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dimensión
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Descripción
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {matrixList.map(
                (matrix) => (

                  <tr
                    key={
                      matrix.id
                    }
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <Grid3X3
                            size={18}
                          />
                        </div>

                        <div>

                          <p className="font-medium text-slate-900">
                            {
                              matrix.name
                            }
                          </p>

                          <p className="text-xs text-slate-400">
                            ID{" "}
                            {
                              matrix.id
                            }
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {matrix.rows}
                        {" × "}
                        {
                          matrix.columns
                        }
                      </span>

                    </td>

                    <td className="max-w-sm px-5 py-4 text-sm text-slate-600">
                      {
                        matrix.description ||
                        "Sin descripción"
                      }
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            setSelectedMatrix(
                              matrix
                            )
                          }
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Ver matriz"
                        >
                          <Eye
                            size={18}
                          />
                        </button>

                        <button
                          onClick={() =>
                            deleteMatrix(
                              matrix.id
                            )
                          }
                          disabled={
                            deletingId ===
                            matrix.id
                          }
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Eliminar matriz"
                        >
                          {deletingId ===
                          matrix.id ? (
                            <RefreshCw
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={18}
                            />
                          )}
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

              {!loading &&
                matrixList.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center"
                    >

                      <Grid3X3
                        size={32}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-medium text-slate-700">
                        No hay matrices guardadas
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Genera una matriz con tus datos y presiona
                        {" "}
                        "Guardar matriz".
                      </p>

                    </td>

                  </tr>

                )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ======================================================
          MATRIZ SELECCIONADA
          ====================================================== */}

      {selectedMatrix && (

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 p-5">

            <div>

              <h2 className="font-semibold text-slate-900">
                {
                  selectedMatrix.name
                }
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {
                  selectedMatrix.description
                }
              </p>

            </div>

            <button
              onClick={() =>
                setSelectedMatrix(
                  null
                )
              }
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              title="Cerrar"
            >
              <X
                size={19}
              />
            </button>

          </div>

          <div className="overflow-x-auto p-5">

            <table className="border-collapse">

              <tbody>

                {selectedMatrix.values.map(
                  (
                    row,
                    rowIndex
                  ) => (

                    <tr
                      key={
                        rowIndex
                      }
                    >

                      {row.map(
                        (
                          value,
                          columnIndex
                        ) => (

                          <td
                            key={
                              columnIndex
                            }
                            className="h-14 min-w-24 border border-slate-200 bg-slate-50 px-4 text-center text-sm font-semibold text-slate-800"
                          >
                            {
                              Number.isInteger(
                                value
                              )
                                ? value
                                : value.toFixed(
                                    2
                                  )
                            }
                          </td>

                        )
                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      )}

    </div>
  );
}