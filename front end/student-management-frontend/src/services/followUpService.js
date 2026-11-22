import { httpRequest } from "./httpClient";

export async function getFollowUps(params = {}) {
    const query = new URLSearchParams(params).toString();

    return await httpRequest(
        `/followUp/search${query ? `?${query}` : ""}`
    );
}

export async function getFollowUpCounts(params = {}) {
    const query = new URLSearchParams(params).toString();

    return await httpRequest(
        `/followUp/counts${query ? `?${query}` : ""}`
    );
}

export async function getFollowUpById(id) {
    return await httpRequest(`/followUp/${id}`);
}

export async function createFollowUp(payload) {
    return await httpRequest("/followUp/create", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateFollowUp(id, payload) {
    return await httpRequest(`/followUp/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function completeFollowUp(id, payload = {}) {
    return await httpRequest(`/followUp/complete/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function snoozeFollowUp(id, payload) {
    return await httpRequest(`/followUp/snooze/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function reactivateFollowUp(id) {
    return await httpRequest(`/followUp/reActive/${id}`, {
        method: "PUT",
    });
}

export async function deleteFollowUp(id) {
    return await httpRequest(`/followUp/deleted/${id}`, {
        method: "DELETE",
    });
}