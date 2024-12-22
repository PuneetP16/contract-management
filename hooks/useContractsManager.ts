import { useReducer, useCallback, useEffect } from "react";
import { ContractUpdate } from "@/types";
import { useRemoteContractUpdates } from "./useRemoteContractUpdates";
import { toast } from "sonner";
import { contractsReducer, initialState } from "@/reducer/contracts";

export const useContractsManager = () => {
  const [state, dispatch] = useReducer(contractsReducer, initialState);

  // Function to handle immediate local updates for the editor (Client A)
  const handleLocalUpdate = useCallback((update: ContractUpdate) => {
    switch (update.type) {
      case "contract.created":
        dispatch({ type: "CREATE_CONTRACT", payload: update.data });
        break;
      case "contract.updated":
        dispatch({ type: "UPDATE_CONTRACT", payload: update.data });
        break;
      case "contract.deleted":
        dispatch({ type: "DELETE_CONTRACT", payload: update.data.id });
        break;
    }

    const action = update.type.split(".")[1];
    toast.success(`Contract ${action} successfully`);
  }, []);

  // Function to handle updates received from remote clients (Client B)
  const handleRemoteUpdate = useCallback((update: ContractUpdate) => {
    const colors = {
      "contract.created": "highlight-created",
      "contract.updated": "highlight-updated",
      "contract.deleted": "highlight-deleted",
    };

    switch (update.type) {
      case "contract.created":
        dispatch({ type: "CREATE_CONTRACT", payload: update.data });
        dispatch({
          type: "SET_HIGHLIGHT",
          payload: { id: update.data.id, color: colors[update.type] },
        });
        toast.success("New contract created by another user");
        break;
      case "contract.updated":
        dispatch({ type: "UPDATE_CONTRACT", payload: update.data });
        dispatch({
          type: "SET_HIGHLIGHT",
          payload: { id: update.data.id, color: colors[update.type] },
        });
        toast.success("Contract updated by another user");
        break;
      case "contract.deleted":
        dispatch({ type: "DELETE_CONTRACT", payload: update.data.id });
        toast.success("Contract deleted by another user");
        break;
    }

    if (update.type !== "contract.deleted") {
      setTimeout(() => {
        dispatch({ type: "CLEAR_HIGHLIGHT", payload: update.data.id });
      }, 3000);
    }
  }, []);

  // Subscribe to contract updates from remote clients
  useRemoteContractUpdates(handleRemoteUpdate);

  // Fetch contracts on mount
  const fetchContracts = useCallback(async () => {
    try {
      const response = await fetch("/api/contracts");
      if (!response.ok) throw new Error("Failed to fetch contracts");
      const data = await response.json();
      dispatch({ type: "SET_CONTRACTS", payload: data });
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Failed to fetch contracts");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts: state.contracts,
    loading: state.loading,
    highlightedRows: state.highlightedRows,
    handleLocalUpdate,
  };
};
