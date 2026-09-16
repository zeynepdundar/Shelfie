'use client';

import { useSelector } from "react-redux";

import { RootState } from "@/lib/store";
import { StatsPage } from "@/components/pages/stats-page";

export default function Stats() {
  const user = useSelector((state: RootState) => state.auth.user);

  return <StatsPage user={user} />;
}
