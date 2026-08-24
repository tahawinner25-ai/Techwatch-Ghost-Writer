import { DriveFile } from "../types";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";

/**
 * List files from the user's Google Drive.
 */
export async function listDriveFiles(
  accessToken: string,
  searchQuery?: string
): Promise<DriveFile[]> {
  try {
    let q = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";
    if (searchQuery && searchQuery.trim().length > 0) {
      const sanitized = searchQuery.replace(/'/g, "\\'");
      q += ` and (name contains '${sanitized}' or fullText contains '${sanitized}')`;
    }

    const fields = "files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)";
    const url = `${DRIVE_API_BASE}/files?pageSize=30&q=${encodeURIComponent(
      q
    )}&orderBy=modifiedTime desc&fields=${encodeURIComponent(fields)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(
        errJson.error?.message || `Erreur Google Drive API (${response.status})`
      );
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error listing Drive files:", error);
    throw error;
  }
}

/**
 * Fetch and extract text content from a Google Drive file.
 * Handles Google Docs (via text/plain export) and direct text/markdown files.
 */
export async function getDriveFileContent(
  accessToken: string,
  file: DriveFile
): Promise<string> {
  try {
    let fetchUrl: string;

    if (file.mimeType === "application/vnd.google-apps.document") {
      // Export Google Doc as clean UTF-8 text
      fetchUrl = `${DRIVE_API_BASE}/files/${file.id}/export?mimeType=text/plain`;
    } else {
      // Standard file media download
      fetchUrl = `${DRIVE_API_BASE}/files/${file.id}?alt=media`;
    }

    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Échec de lecture du fichier (${response.status}): ${err}`);
    }

    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error reading file content from Drive:", error);
    throw error;
  }
}

/**
 * Save / Upload a generated newsletter to Google Drive.
 * Uses multipart upload.
 */
export async function createDriveFile(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: "text/html" | "text/markdown" | "text/plain",
  description?: string
): Promise<DriveFile> {
  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      description: description || "Généré par TechWatch Ghostwriter",
    };

    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      content +
      closeDelimiter;

    const url = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(
        errJson.error?.message ||
          `Échec de l'enregistrement sur Google Drive (${response.status})`
      );
    }

    const result = await response.json();
    return result as DriveFile;
  } catch (error) {
    console.error("Error creating Drive file:", error);
    throw error;
  }
}
