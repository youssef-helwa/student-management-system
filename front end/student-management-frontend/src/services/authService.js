import { httpRequest } from "./httpClient";


// =========================
// FIRST-TIME SETUP STATUS
// =========================
export async function getSetupStatus() {
    const response = await httpRequest("/auth/setup-status", {
        method: "GET",
    });

    return response.data;
}


// =========================
// CREATE FIRST ADMINISTRATOR
// =========================

export async function setupAdministrator({
    fullName,
    email,
    password,
    confirmPassword,
}) {
    const response = await httpRequest("/auth/setup", {
        method: "POST",
        body: JSON.stringify({
            fullName,
            email,
            password,
            confirmPassword,
        }),
    });

    const data = response.data;

    if (!data?.accessToken || !data?.admin) {
        throw new Error("Invalid setup response from backend");
    }

    localStorage.setItem("token", data.accessToken);

    return data;
}



// =========================
// LOGIN
// =========================
export async function login({ username, password }) {
    if (!username || !password) {
        throw new Error("Username and password are required.");
    }

    const response = await httpRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: username,
            password: password,
        }),
    });

    // Save JWT token
    localStorage.setItem(
        "token",
        response.data.accessToken
    );

    // Save logged-in user
    localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
    );

    return response.data;
}


// =========================
// LOGOUT
// =========================
export async function logout() {
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await httpRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({
            userId: user?.id,
        }),
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return response.data;
}


// =========================
// CHANGE PASSWORD
// =========================
export async function changePassword({
    password,
    newPassword,
    ConfirmPassword,
}) {
    const response = await httpRequest(
        "/auth/change-password",
        {
            method: "POST",
            body: JSON.stringify({
                password,
                newPassword,
                ConfirmPassword,
            }),
        }
    );

    return response.data;
}


// =========================
// RESET PASSWORD
// Admin / Manager
// =========================
export async function resetPassword(
    userId,
    { newPassword, confirmPassword }
) {
    const response = await httpRequest(
        `/auth/reset-password/${userId}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                newPassword,
                confirmPassword,
            }),
        }
    );

    return response.data;
}


// =========================
// GET CURRENT USER
// =========================
export function getCurrentUser() {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}


// =========================
// GET TOKEN
// =========================
export function getToken() {
    return localStorage.getItem("token");
}


// =========================
// CHECK LOGIN
// =========================
export function isAuthenticated() {
    return !!localStorage.getItem("token");
}


// =========================
// CLEAR AUTH
// =========================
export function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}