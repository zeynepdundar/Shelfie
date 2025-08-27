'use client';
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { OverviewPage } from "@/components/pages/overview-page";

export default function Overview() {
  const user = useSelector((state: RootState) => state.auth.user);
  
  return <OverviewPage user={user}/>;
}
