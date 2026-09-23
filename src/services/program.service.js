import apiClient from "../api/apiClient";

export const getPrograms = async (params = {}) => {
  const response = await apiClient.get("/programs", {
    params,
  });

  return response.data;
};

export const createProgram = async (programData) => {
  const response = await apiClient.post(
    "/programs",
    programData
  );

  return response.data;
};

export const updateProgram = async (programId, programData) => {
  const response = await apiClient.patch(
    `/programs/${programId}`,
    programData
  );

  return response.data;
};

export const deleteProgram = async (programId) => {
  const response = await apiClient.delete(
    `/programs/${programId}`
  );

  return response.data;
};

export const toggleProgramStatus = async (programId) => {
  const response = await apiClient.patch(
    `/programs/${programId}/status`
  );

  return response.data;
};
export const getActivePrograms = async () => { const response = await apiClient.get("/programs/active"); return response.data; };
