"use client";

import * as React from "react";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  show: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a Toaster");
  }
  return context;
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const show = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md transform transition-all duration-300 ease-in-out ${
              toast.variant === "destructive"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && <div className="text-sm">{toast.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
