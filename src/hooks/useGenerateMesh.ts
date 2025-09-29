// src/hooks/useGenerateMesh.ts
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface MeshResp {
  glb_url: string;
  inp_url: string;
}

export const useGenerateMesh = () =>
  useMutation<MeshResp, Error, { project_id: string }>({
    mutationFn: (body) =>
      api.post<MeshResp>("/meshing/generate", body).then((r) => r.data),
  });
