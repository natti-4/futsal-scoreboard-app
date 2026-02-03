"use client";

import useSWR, { mutate } from "swr";
import { createClient } from "@/lib/supabase/client";

export type Team = {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

const SWR_KEY = "team";
const supabase = createClient();

const fetchTeam = async (): Promise<Team | null> => {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export function useTeam() {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(SWR_KEY, fetchTeam, {
    fallbackData: {
      id: "",
      name: "マイチーム",
      color: "#3b82f6",
      created_at: "",
      updated_at: "",
    } as Team,
  });

  return {
    team: data ?? ({ name: "マイチーム", color: "#3b82f6" } as Team),
    isLoading,
    error,
    revalidate,
  };
}

export async function updateTeam(updates: {
  name?: string;
  color?: string;
}): Promise<Team> {
  const { data: existing } = await supabase
    .from("teams")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("teams")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    mutate(SWR_KEY, data, { revalidate: false });
    return data;
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: updates.name ?? "マイチーム",
      color: updates.color ?? "#3b82f6",
    })
    .select()
    .single();

  if (error) throw error;
  mutate(SWR_KEY, data, { revalidate: false });
  return data;
}

export function mutateTeam() {
  mutate(SWR_KEY);
}
