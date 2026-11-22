import { httpRequest } from "./httpClient";

// Get call options
export const getCallOptions = async () => {
    const response = await httpRequest("/call/options");
    return response.data;
};

// Get calls for a specific student
export async function getCallHistoryByStudent(studentId) {
    const response = await httpRequest(`/call/Student/${studentId}`);
    return response.data;
}

// Log a new call
export async function logCall(payload) {
    const response = await httpRequest("/call", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return response.data;
}