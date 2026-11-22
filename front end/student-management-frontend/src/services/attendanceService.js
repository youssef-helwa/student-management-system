import { httpRequest } from "./httpClient";

export const DAY_TYPES = {
    REGULAR: "regular",
    EXAM: "exam",
};


// =====================================================
// Get attendance records with filters
// =====================================================

export async function getAttendanceRecords(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== "all"
        ) {
            query.append(key, value);
        }
    });

    const queryString = query.toString();

    const response = await httpRequest(
        `/att/search${queryString ? `?${queryString}` : ""}`
    );

    console.log("Attendance service response:", response);

    return response?.data ?? [];
}


// =====================================================
// Get ALL attendance records
// =====================================================

export async function getAllAttendance(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            query.append(key, value);
        }

    });

    const queryString = query.toString();

    const response = await httpRequest(
        `/att/All${queryString ? `?${queryString}` : ""}`
    );

    return response?.data?.data ?? [];
};


// =====================================================
// Search attendance
// =====================================================

export async function getAttendance(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== "all"
        ) {
            query.append(key, value);
        }

    });

    const queryString = query.toString();

    const response = await httpRequest(
        `/att/search${queryString ? `?${queryString}` : ""}`
    );

    return response?.data?.data ?? [];
};


// =====================================================
// Find student by QR
// =====================================================

export async function findStudentByQr(qrCode) {

    const response = await httpRequest(
        `/att/qr/${encodeURIComponent(qrCode)}`
    );

    return response?.data?.data ?? response?.data ?? null;
}


// =====================================================
// Find student by student code
// =====================================================

export async function findStudentByCode(studentCode) {

    const response = await httpRequest(
        `/att/code/${encodeURIComponent(studentCode)}`
    );

    return response?.data?.data ?? response?.data ?? null;
}


// =====================================================
// Record attendance
// =====================================================

export async function recordAttendance(payload) {

    const response = await httpRequest("/att/record", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return response?.data?.data ?? response?.data ?? null;
}


// =====================================================
// Get today's day type
// =====================================================

export async function getDayType({ branchId, date }) {

    const query = new URLSearchParams();

    if (branchId) {
        query.append("branchId", branchId);
    }

    if (date) {
        query.append("date", date);
    }

    const response = await httpRequest(
        `/att/day-type?${query.toString()}`
    );

    return response?.data?.data ?? DAY_TYPES.REGULAR;
}


// =====================================================
// Set today's day type
// =====================================================

export async function setDayType({
    branchId,
    date,
    dayType
}) {

    const response = await httpRequest("/att/day-type", {
        method: "POST",

        body: JSON.stringify({
            branchId,
            date,
            dayType
        })
    });

    return response?.data?.data ?? null;
}