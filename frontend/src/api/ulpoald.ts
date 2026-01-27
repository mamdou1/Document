import api from "./axios";

export const uploadDocumentFile = async (
  documentId: string,
  fieldId: string,
  file: File,
) => {
  const form = new FormData();
  form.append("file", file);

  console.log("📤 upload file", { documentId, fieldId });

  const response = await api.post(`/uploads/${documentId}/${fieldId}`, form);

  return response.data;
};
