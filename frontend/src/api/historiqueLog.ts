import axios from "axios";
import type { HistoriqueLog } from "../interfaces/index";

const API_URL = "http://localhost:5001/api/historique";

// Récupérer la liste des logs avec pagination et filtres
export async function getHistoriqueLogs(params?: {
  page?: number;
  limit?: number;
  agent_id?: number;
  action?: string;
  resource?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ data: HistoriqueLog[]; pagination: any }> {
  const token = localStorage.getItem("accessToken");

  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
}

// Récupérer le détail d’un log par ID
export async function getHistoriqueLogById(id: number): Promise<HistoriqueLog> {
  const token = localStorage.getItem("accessToken");

  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}
