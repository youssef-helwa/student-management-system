const BASE_URL = "http://localhost:3000";

export async function httpRequest(url, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
            ...(options.headers || {}),
        },
    });

    // اقرأ الـ response كنص أولاً
    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {
    const error = new Error(
        typeof data === "object" && (data?.message || data?.error)
            ? data.message || data.error
            : "Something went wrong"
    );

    error.status = response.status;
    error.data = data;

    throw error;
}

    return data;
}