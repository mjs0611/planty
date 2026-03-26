"use client";

import { useEffect } from "react";

export default function ProfilePage() {
  useEffect(() => {
    window.location.replace("/?tab=profile");
  }, []);
  return null;
}
