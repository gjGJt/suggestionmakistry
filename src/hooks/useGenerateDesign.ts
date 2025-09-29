import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface GenerateResp {
  project_id: string;
  cad_version: number;
  code: string;
  blob_url: string;
}

export const useGenerateDesign = () =>
  useMutation<GenerateResp, Error, { project_id: string }>({
    mutationFn: (body) =>
      api.post<GenerateResp>("/generate-design", body).then((r) => r.data),
  });
