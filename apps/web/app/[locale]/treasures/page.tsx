'use client';

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { TreasuresPage } from "@/components/pages/treasures-page";

export default function Treasures() {
  const user = useSelector((state: RootState) => state.auth.user);
  return <TreasuresPage user={user} />;
}
