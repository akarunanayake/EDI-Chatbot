const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function joinApiPath(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const trimmedBase = API_BASE_URL.replace(/\/+$/, "");
  return `${trimmedBase}${normalizedPath}`;
}

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
    const response = await fetch(joinApiPath(path));
    return parseResponse(response);
  } catch (error) {
    throw normalizeError(error, "Network error. Please try again.");
  }
}

export async function apiPostJson(path, payload) {
  try {
    const response = await fetch(joinApiPath(path), {
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
    const response = await fetch(joinApiPath(path), {
      method: "POST",
      body: formData,
    });
    return parseResponse(response);
  } catch (error) {
    throw normalizeError(error, "Network error. Please try again.");
  }
}

export function apiPath(path) {
  return joinApiPath(path);
}

export function resolveBackendFileLink(fileLink) {
  if (!fileLink) {
    return fileLink;
  }

  try {
    const parsed = new URL(fileLink, API_BASE_URL);
    const normalizedPath = parsed.pathname.replace(/\/+$/, "");

    if (normalizedPath !== "/viewFile") {
      return fileLink;
    }

    return joinApiPath(`/viewFile${parsed.search}`);
  } catch {
    return fileLink;
  }
}
