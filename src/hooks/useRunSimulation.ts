import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface SimRunResp {
  status: string;
  results: { glb?: string; frd?: string; dat?: string };
}

export const useRunSimulation = () =>
  useMutation<SimRunResp, Error, { project_id: string }>({
    mutationFn: (body) =>
      api.post<SimRunResp>("/run-simulation", body).then((r) => r.data),
  });
