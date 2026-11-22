import { httpRequest } from "./httpClient";

export async function getGrades(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/grade/all${query ? `?${query}` : ""}`
    );

    return response?.data ?? [];
}

export async function getGradeById(id) {
    const response = await httpRequest(`/grade/${id}`);

    return response?.data ?? null;
}

export async function createGrade(payload) {
    const response = await httpRequest("/grade/add", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return response?.data;
}

export async function updateGrade(id, payload) {
    const response = await httpRequest(`/grade/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return response?.data;
}

export async function deleteGrade(id) {
    const response = await httpRequest(`/grade/delete/${id}`, {
        method: "DELETE",
    });

    return response?.data;
}




// ===============================
// GRADE FEES
// =============================== 
export async function getGradeFees(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/grade/grade-fee${query ? `?${query}` : ""}`
    );

    return response?.data ?? [];
}

export async function createGradeFee(gradeId, payload) {
    const response = await httpRequest(`/grade/add-fee/${gradeId}`, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return response?.data;
}

export async function updateGradeFee(gradeId, payload) {
    const response = await httpRequest(`/grade/update-fee/${gradeId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return response?.data;
}