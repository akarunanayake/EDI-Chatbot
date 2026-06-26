const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function normalizeError(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error(fallbackMessage);
}

async function parseResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || "Request failed.";
    throw new Error(message);
  }

  return data;
}

export async function apiGet(path) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    return parseResponse(response);
  } catch (error) {
    throw normalizeError(error, "Network error. Please try again.");
  }
}

export async function apiPostJson(path, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  } catch (error) {
    throw normalizeError(error, "Network error. Please try again.");
  }
}

export async function apiPostForm(path, formData) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      body: formData,
    });
    return parseResponse(response);
  } catch (error) {
    throw normalizeError(error, "Network error. Please try again.");
  }
}

export function apiPath(path) {
  return `${API_BASE_URL}${path}`;
}
