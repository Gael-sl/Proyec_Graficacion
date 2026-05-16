import React from "react";
import { toast } from "@/components/ui/use-toast";

export function confirmToast({
  title = "Confirmar accion",
  description = "Esta accion no se puede deshacer.",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar"
} = {}) {
  return new Promise((resolve) => {
    const { dismiss } = toast({
      title,
      description,
      action: (
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            className="toast-action-button flex-1"
            onClick={() => {
              dismiss();
              resolve(true);
            }}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            className="toast-cancel-button flex-1"
            onClick={() => {
              dismiss();
              resolve(false);
            }}
          >
            {cancelLabel}
          </button>
        </div>
      )
    });
  });
}
