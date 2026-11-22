import { httpRequest } from "./httpClient";

export async function getUsers() {
  const response = await httpRequest("/user/users");

  console.log("GET USERS RESPONSE:", response);

  return response?.data || [];
}

export async function getUserById(id) {
  return httpRequest(`/user/user/${id}`);
}

export async function createUser(payload) {
  return httpRequest("/user/add-user", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return httpRequest("/user/me");
}

export async function updateUser(id, payload) {
  return httpRequest(`/user/update-user/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id) {
  return httpRequest(`/user/delete-user/${id}`, {
    method: "DELETE",
  });
}

export async function updateUserStatus(id, payload) {
  return httpRequest(`/user/user-status/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function searchUsers(search) {
  return httpRequest(
    `/user/search?search=${encodeURIComponent(search)}`
  );
}

export async function getPermissionMatrix() {
  return httpRequest("/user/permission");
}