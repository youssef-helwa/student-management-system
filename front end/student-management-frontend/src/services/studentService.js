import { httpRequest } from "./httpClient";


// =========================
// GET ALL STUDENTS
// =========================
export async function getStudents(params = {}) {
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
        `/student${queryString ? `?${queryString}` : ""}`
    );

    return response.data;
}


// =========================
// SEARCH STUDENTS
// =========================
export async function searchStudents(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value);
        }
    });

    const queryString = query.toString();

    const response = await httpRequest(
        `/student/search${queryString ? `?${queryString}` : ""}`
    );

    return response.data;
}


// =========================
// GET ONE STUDENT
// =========================
// Your backend currently does NOT have
// GET /student/:id
//
// So we don't create this function yet.


// =========================
// CREATE STUDENT
// =========================
export async function createStudent(studentData) {
    const response = await httpRequest("/student/add", {
        method: "POST",
        body: JSON.stringify(studentData),
    });

    return response.data;
}


// =========================
// UPDATE STUDENT
// =========================
export async function updateStudent(id, studentData) {
    const response = await httpRequest(`/student/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(studentData),
    });

    return response.data;
}


// =========================
// DELETE STUDENT
// =========================
export async function deleteStudent(id) {
    const response = await httpRequest(`/student/delete/${id}`, {
        method: "DELETE",
    });

    return response.data;
}


export async function getStudentByCode(code) {
    const response = await searchStudents({
        studentCode: code,
    });

    // لو search بيرجع array
    return Array.isArray(response) ? response[0] : response;
}


// =========================
// GET ONE STUDENT BY ID
// =========================
export async function getStudentById(id) {
    const response = await httpRequest(`/student/${id}`);

    return response.data;
}