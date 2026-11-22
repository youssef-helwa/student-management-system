import { httpRequest } from "./httpClient";

// Get all classes
export async function getClasses(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/class/all${query ? `?${query}` : ""}`
    );

    console.log("========== CLASSES API RESPONSE ==========");
    console.log("RESPONSE:", response);
    console.log("RESPONSE DATA:", response?.data);
    console.log("IS ARRAY:", Array.isArray(response?.data));
    console.log("==========================================");

    return response?.data ?? [];
}

// Get one class
export async function getClassById(id) {
    const response = await httpRequest(`/class/${id}`);

    return response?.data ?? null;
}

// Create class
export async function createClass(payload) {
    const response = await httpRequest("/class/add", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return response?.data;
}

// Update class
export async function updateClass(id, payload) {
    const response = await httpRequest(`/class/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return response?.data;
}

// Delete class
export async function deleteClass(id) {
    const response = await httpRequest(`/class/delete/${id}`, {
        method: "DELETE",
    });

    return response?.data;
}