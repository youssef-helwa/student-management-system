import { httpRequest } from "./httpClient";

export async function getDailyFinancials({ branchId, date } = {}) {
    const params = new URLSearchParams();

    if (branchId) params.append("branchId", branchId);
    if (date) params.append("date", date);

    const query = params.toString();

    const response = await httpRequest(
        `/report/financial/daily${query ? `?${query}` : ""}`
    );

    return response.data;
}


export async function getFinancialReport({ branchId, date } = {}) {
    const params = new URLSearchParams();

    if (branchId) params.append("branchId", branchId);
    if (date) params.append("date", date);

    const query = params.toString();

    const response = await httpRequest(
        `/report/financial${query ? `?${query}` : ""}`
    );

    return response.data;
}


export async function getFinancialReportsList({ branchId, from, to } = {}) {
    const params = new URLSearchParams();

    if (branchId) params.append("branchId", branchId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const query = params.toString();

    const response = await httpRequest(
        `/report/financial/list${query ? `?${query}` : ""}`
    );

    return response.data;
}


export async function getFeeTypeSummary({ branchId } = {}) {
    const params = new URLSearchParams();

    if (branchId) params.append("branchId", branchId);

    const query = params.toString();

    const response = await httpRequest(
        `/report/fee-type-summary${query ? `?${query}` : ""}`
    );

    return response.data;
}


export async function getEndOfDaySummary({ branchId, date } = {}) {
    const params = new URLSearchParams();

    if (branchId) params.append("branchId", branchId);
    if (date) params.append("date", date);

    const query = params.toString();

    const response = await httpRequest(
        `/report/end-of-day${query ? `?${query}` : ""}`
    );

    return response.data;
}


export async function sendDailyReport({ branchId, date }) {
    const response = await httpRequest("/report/send-daily", {
        method: "POST",
        body: JSON.stringify({
            branchId,
            date
        })
    });

    return response.data;
}