import { httpRequest } from "./httpClient";

// Get all exams
export async function getExams(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/exam${query ? `?${query}` : ""}`
    );

    return response?.data ?? [];
}

// Search/filter exams
export async function searchExams(params = {}) {
    const query = new URLSearchParams(params).toString();

    return await httpRequest(
        `/exam/search${query ? `?${query}` : ""}`
    );
}

// Get one exam
export async function getExamById(id) {
    return await httpRequest(`/exam/${id}`);
}

// Get all exam results
export async function getAllResults() {
    const response = await httpRequest("/exam/results/all");

    return response?.data ?? [];
}

// Get results for one exam
export async function getExamResults(examId) {
    return await httpRequest(`/exam/Resulte/${examId}`);
}

// Create exam
export async function createExam(payload) {
    return await httpRequest("/exam/create", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// Get results for one student
export async function getStudentResults(studentId) {
    const response = await httpRequest(`/exam/results/${studentId}`);

    const data = response.data?.data ?? response.data ?? [];

    return Array.isArray(data) ? data : [];
}
// Update exam
export async function updateExam(id, payload) {
    return await httpRequest(`/exam/Update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

// Save student result
export async function saveResult(payload) {
    return await httpRequest("/exam/resulte", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// Get result audit trail
export async function getResultAudit(examId, studentId) {
    return await httpRequest(
        `/exam/${examId}/results/${studentId}/audit`
    );
}

// Mark student absent
export async function markStudentAbsent(examId, studentId) {
    return await httpRequest(
        `/exam/${examId}/absent/${studentId}`,
        {
            method: "POST",
        }
    );
}