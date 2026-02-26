"use client";

import { useEffect } from "react";
import { RotateCcw, type LucideIcon } from "lucide-react";

interface UndoToastProps {
  msg: string;
  onUndo: () => void;
  onDone: () => void;
}

export function UndoToast({ msg, onUndo, onDone }: UndoToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: "#1a1a2e",
        borderRadius: 14,
        padding: "10px 12px 10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        animation: "toastIn 0.35s cubic-bezier(0.16,1,0.3,1)",
        fontSize: 13,
        color: "white",
        minWidth: 200,
      }}
    >
      <span style={{ flex: 1, fontWeight: 500 }}>{msg}</span>
      <button
        onClick={onUndo}
        style={{
          background: "rgba(255,255,255,0.15)",
          border: "none",
          borderRadius: 8,
          padding: "5px 12px",
          color: "#66bb6a",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <RotateCcw size={12} />
        Undo
      </button>
    </div>
  );
}

interface CoinToastProps {
  msg: string;
  icon: LucideIcon;
  onDone: () => void;
}

export function CoinToast({ msg, icon: Ic, onDone }: CoinToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: "white",
        borderRadius: 14,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 7,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        animation: "toastIn 0.35s cubic-bezier(0.16,1,0.3,1)",
        fontWeight: 600,
        fontSize: 13,
        color: "#d97706",
      }}
    >
      {Ic && <Ic size={15} />}
      {msg}
    </div>
  );
}
