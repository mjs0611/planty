"use client";
import { ThemeProvider, PortalProvider } from "@toss/tds-mobile";
import { ReactNode } from "react";

export default function TDSProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PortalProvider>
        {children}
      </PortalProvider>
    </ThemeProvider>
  );
}
