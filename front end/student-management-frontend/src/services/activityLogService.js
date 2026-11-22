import { httpRequest } from "./httpClient";

export async function getAllLogs() {
    const response = await httpRequest("/log/Logs");

    console.log("ACTIVITY LOG RESPONSE:", response);

    return response?.data || [];
}

export async function searchLogs(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/log/search${query ? `?${query}` : ""}`
    );

    return response?.data || [];
}