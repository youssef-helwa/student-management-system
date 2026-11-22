import { httpRequest } from "./httpClient";


// =========================
// ATTENDANCE REPORT
// =========================
export async function getAttendanceReport(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/attendance${query ? `?${query}` : ""}`
    );

    const data = response.data?.data ?? response.data ?? null;

    console.log("ATTENDANCE REPORT RESPONSE:", data);

    return data;
}


export const getAttendanceTrend = async (params = {}) => {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/attendance/trend${query ? `?${query}` : ""}`
    );

    const data = response.data?.data ?? response.data ?? [];

    return Array.isArray(data) ? data : [];
};

// =========================
// ABSENCE REPORT
// =========================
export async function getAbsenceReport(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/abcent${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// STUDENT ABSENCE DETAIL
// =========================
export async function getStudentAbsenceDetail(studentId, params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/absence/student/${studentId}${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// EXAM REPORT
// =========================
export async function getExamReports(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/exam${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// PAYMENT REPORT
// =========================
export async function getPaymentReport(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/payment${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// FEE TYPE SUMMARY
// =========================
export async function getFeeTypeSummary(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/fee-type-summary${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// END OF DAY SUMMARY
// =========================
export async function getEndOfDaySummary(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/end-of-day${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// DAILY FINANCIALS
// =========================
export async function getDailyFinancials(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/financial/daily${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// FINANCIAL REPORT
// =========================
export async function getFinancialReport(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/financial${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// FINANCIAL REPORTS LIST
// =========================
export async function getFinancialReportsList(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/report/financial/list${query ? `?${query}` : ""}`
    );

    return response.data;
}


// =========================
// SEND DAILY REPORT
// =========================
export async function sendDailyReport(reportData = {}) {
    const response = await httpRequest("/report/send-daily", {
        method: "POST",
        body: JSON.stringify(reportData),
    });

    return response.data;
}