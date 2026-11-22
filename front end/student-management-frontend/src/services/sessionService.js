import { httpRequest } from "./httpClient";

// =========================
// START SESSION
// =========================
export async function startSession(sessionData) {
    const response = await httpRequest("/session/start", {
        method: "POST",
        body: JSON.stringify(sessionData),
    });

    return response.data;
}


// =========================
// GET ACTIVE SESSION FOR CLASS
// =========================
export async function getActiveSessionForClass(classId) {
    const response = await httpRequest(
        `/session/active/${classId}`
    );

    return response.data;
}


// =========================
// GET SESSION BY ID
// =========================
export async function getSession(id) {
    const response = await httpRequest(
        `/session/${id}`
    );

    return response.data;
}


// =========================
// CLOSE SESSION
// =========================
export async function closeSession(id) {
    const response = await httpRequest(
        `/session/close/${id}`,
        {
            method: "POST",
        }
    );

    return response.data;
}


// =========================
// GET SESSION ATTENDANCE
// =========================
export async function getSessionAttendance(id) {
    const response = await httpRequest(
        `/session/att/${id}`
    );

    return response.data;
}