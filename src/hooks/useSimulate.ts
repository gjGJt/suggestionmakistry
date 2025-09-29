import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SimResp {
  project_id: string;
  simulation_version: number;
  cad_step_version: number;
  simulation_json: any;
}

export const useSimulate = () =>
  useMutation<SimResp, Error, { project_id: string }>({
    mutationFn: (body) =>
      api.post<SimResp>("/prepare-simulation", body).then((r) => r.data),
  });
