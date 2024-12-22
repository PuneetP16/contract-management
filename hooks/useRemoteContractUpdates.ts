"use client";

import { useState, useEffect } from "react";

import { ContractUpdate } from "@/types";
import { pusherClient } from "@/lib/pusher";

export function useRemoteContractUpdates(
  onUpdate: (update: ContractUpdate) => void
) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channel = pusherClient.subscribe("contracts");
    channel.bind("contract.update", (data: ContractUpdate) => {
      console.log("Received contract update:", data);
      onUpdate({
        ...data,
        data: {
          ...data.data,
          createdAt: new Date(data.data.createdAt).toISOString(),
          updatedAt: data.data.updatedAt
            ? new Date(data.data.updatedAt).toISOString()
            : undefined,
        },
      });
    });

    channel.bind("pusher:subscription_error", (error: Error) => {
      console.error("Pusher subscription error:", error);
      setError("Failed to connect to update stream");
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe("contracts");
    };
  }, [onUpdate]);

  return { error };
}
