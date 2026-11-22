import { httpRequest } from "./httpClient";

// Get all payments
export async function getAllPayments(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value);
        }
    });

    const queryString = query.toString();

    const response = await httpRequest(
        `/payment${queryString ? `?${queryString}` : ""}`
    );

    return {
        summary: response.data?.summary ?? {
            expectedIncome: 0,
            amountCollected: 0,
            remainingUnpaidAmount: 0
        },
        paymentData: response.data?.paymentData ?? []
    };
}


// Get payment for a specific student
export async function getPaymentByStudent(studentId) {
    const response = await httpRequest(
        `/payment/paymetbystudent/${studentId}`
    );

    return response.data?.data ?? response.data ?? null;
}


// Update student's total fee
export async function updateTotalFee(payload) {
    const response = await httpRequest("/payment/total-fee", {
        method: "PUT",
        body: JSON.stringify(payload)
    });

    return response.data?.data ?? response.data;
}


// Get payments with filters
export async function getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();

    const response = await httpRequest(
        `/payment${query ? `?${query}` : ""}`
    );

    console.log("PAYMENTS API RESPONSE:", response.data);

    return response.data?.paymentData ?? [];
}