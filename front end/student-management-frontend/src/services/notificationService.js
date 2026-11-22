import { httpRequest } from "./httpClient";


// Get all notifications
export async function getAllNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/notification/All${query ? `?${query}` : ""}`
    );

    return response.data;
}


// Get unread notification count
export async function getUnreadNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/notification/unread${query ? `?${query}` : ""}`
    );

    return response.data;
}


// Mark one notification as read
export async function readNotification(id) {
    const response = await httpRequest(
        `/notification/read/${id}`,
        {
            method: "PATCH"
        }
    );

    return response.data;
}


// Mark all notifications as read
export async function readAllNotifications(payload = {}) {
    const response = await httpRequest(
        "/notification/readAll",
        {
            method: "PATCH",
            body: JSON.stringify(payload)
        }
    );

    return response.data;
}


// Delete notification
export async function deleteNotification(id) {
    const response = await httpRequest(
        `/notification/delete/${id}`,
        {
            method: "DELETE"
        }
    );

    return response.data;
}