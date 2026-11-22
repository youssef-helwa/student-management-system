import { httpRequest } from "./httpClient";

export async function getExpenses(params = {}) {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ''
        )
    );

    const query = new URLSearchParams(cleanParams).toString();

    const response = await httpRequest(
        `/expenses/${query ? `?${query}` : ""}`
    );

    return response.data || [];
}

export async function getExpenseById(id) {
    const response = await httpRequest(`/expenses/${id}`);
    return response.data;
}

export async function createExpense(payload) {
    const response = await httpRequest("/expenses/add", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function updateExpense(id, payload) {
    const response = await httpRequest(`/expenses/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function deleteExpense(id) {
    const response = await httpRequest(`/expenses/delete/${id}`, {
        method: "DELETE",
    });

    return response.data;
}

export async function approveExpense(id) {
    const response = await httpRequest(`/expenses/approve/${id}`, {
        method: "PUT",
    });

    return response.data;
}

export async function rejectExpense(id) {
    const response = await httpRequest(`/expenses/reject/${id}`, {
        method: "PUT",
    });

    return response.data;
}