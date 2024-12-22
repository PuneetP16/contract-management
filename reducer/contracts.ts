import { Contract } from "@/types";

export type ContractsState = {
  contracts: Contract[];
  loading: boolean;
  highlightedRows: { [key: string]: string };
};

export type ContractsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONTRACTS"; payload: Contract[] }
  | { type: "CREATE_CONTRACT"; payload: Contract }
  | { type: "UPDATE_CONTRACT"; payload: Contract }
  | { type: "DELETE_CONTRACT"; payload: string }
  | { type: "SET_HIGHLIGHT"; payload: { id: string; color: string } }
  | { type: "CLEAR_HIGHLIGHT"; payload: string };

export const initialState: ContractsState = {
  contracts: [],
  loading: true,
  highlightedRows: {},
};

export function contractsReducer(
  state: ContractsState,
  action: ContractsAction
): ContractsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_CONTRACTS":
      return { ...state, contracts: action.payload };

    case "CREATE_CONTRACT":
      return {
        ...state,
        contracts: [action.payload, ...state.contracts],
      };

    case "UPDATE_CONTRACT":
      return {
        ...state,
        contracts: state.contracts.map((contract) =>
          contract.id === action.payload.id ? action.payload : contract
        ),
      };

    case "DELETE_CONTRACT":
      return {
        ...state,
        contracts: state.contracts.filter(
          (contract) => contract.id !== action.payload
        ),
      };

    case "SET_HIGHLIGHT":
      return {
        ...state,
        highlightedRows: {
          ...state.highlightedRows,
          [action.payload.id]: action.payload.color,
        },
      };

    case "CLEAR_HIGHLIGHT":
      const newHighlightedRows = { ...state.highlightedRows };
      delete newHighlightedRows[action.payload];
      return { ...state, highlightedRows: newHighlightedRows };

    default:
      return state;
  }
}
