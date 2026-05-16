import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusColors = {
  borrador: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completo: "bg-blue-100 text-blue-700 border-blue-200",
  analizado: "bg-green-100 text-green-700 border-green-200"
};

export default function CatalogTable({ 
  data = [], 
  columns = [], 
  onView, 
  onDelete,
  emptyMessage = "No hay registros disponibles"
}) {
  return (
    <div className="glass-table rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-white/60 hover:bg-white/70">
            {columns.map((col) => (
              <TableHead key={col.key} className="font-semibold text-slate-700">
                {col.label}
              </TableHead>
            ))}
            <TableHead className="font-semibold text-slate-700 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} className="hover:bg-white/50 transition-colors">
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row[col.key], row) : (
                      col.type === "date" && row[col.key] ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {format(new Date(row[col.key]), "dd MMM yyyy", { locale: es })}
                        </div>
                      ) : col.type === "badge" && row[col.key] ? (
                        <Badge variant="secondary" className={statusColors[row[col.key]] || "bg-slate-100 text-slate-700"}>
                          {row[col.key]}
                        </Badge>
                      ) : (
                        <span className="text-slate-700">{row[col.key] || "-"}</span>
                      )
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(row)}
                      className="glass-button-outline"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(row)}
                      className="glass-button-outline hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}