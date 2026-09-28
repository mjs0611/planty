"use client";
// SDK 3.x: TDS는 @toss/tds-mobile-ait의 TDSMobileAITProvider로 감싸야 토스 앱 안에서 동작한다
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { ReactNode } from "react";

export default function TDSProvider({ children }: { children: ReactNode }) {
  return <TDSMobileAITProvider>{children}</TDSMobileAITProvider>;
}
