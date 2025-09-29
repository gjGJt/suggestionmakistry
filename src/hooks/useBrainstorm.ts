import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";


/** ---------------- Types returned by /brainstorm ---------------- */
export interface BrainstormJSON {
  design_one_liner: string;
  project_name:      string;
  key_features:      string[];
  key_functionalities: string[];
  design_components: string[];
  optimal_geometry:  Record<string, string | number>;
  optimal_material:  Record<string, string>;
  parametric_information: Record<string, string | number>;
  /** any extra fields … */
  [k: string]: unknown;
}

export interface BrainstormResp {
  project_id: string;
  brainstorm: BrainstormJSON;
}

export const useBrainstorm = () =>
  useMutation<BrainstormResp, Error, string>({
    mutationFn: (prompt) =>
      api.post("/brainstorm", { prompt }).then((r) => r.data),
  });
