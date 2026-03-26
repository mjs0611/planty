"use client";

import { useEffect } from "react";

export default function GardenPage() {
  useEffect(() => {
    window.location.replace("/?tab=garden");
  }, []);
  return null;
}
