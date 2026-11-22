import { httpRequest } from "./httpClient";

// Get all branches
export const getBranches = async () => {
    const response = await httpRequest('/branch/branches');

    console.log("GET BRANCHES RESPONSE:", response);

    return response.data;
};

// Get one branch
export async function getBranchById(id) {
    const response = await httpRequest(`/branch/Get-branch/${id}`);

    return response.data;
}

// Create branch
export async function createBranch(payload) {
    try {
        const response = await httpRequest("/branch/Create-Branch", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        return response.data;
    } catch (error) {
        console.log("========== CREATE BRANCH ERROR ==========");
        console.log("ERROR:", error);
        console.log("ERROR MESSAGE:", error?.message);
        console.log("ERROR DATA:", error?.data);
        console.log("ERROR STATUS:", error?.status);
        console.log("==========================================");

        throw error;
    }
}

// Update branch
export async function updateBranch(id, payload) {
    const response = await httpRequest(`/branch/Update-branch/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return response.data;
}

// Delete branch
export async function deleteBranch(id) {
    const response = await httpRequest(`/branch/delete-branch/${id}`, {
        method: "DELETE",
    });

    return response.data;
}