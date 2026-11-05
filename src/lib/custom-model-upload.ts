import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  CUSTOM_MODEL_EXTENSIONS,
  CUSTOM_MODEL_MAX_BYTES,
} from "@/lib/custom-model-constants";

export {
  CUSTOM_MODEL_EXTENSIONS,
  CUSTOM_MODEL_MAX_BYTES,
} from "@/lib/custom-model-constants";

export type SavedCustomModel = {
  modelFileName: string;
  modelFilePath: string;
  modelFileSize: number;
};

function extensionOf(filename: string): string {
  return path.extname(filename).toLowerCase();
}

function sanitizeBaseName(filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  return (
    base
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "model"
  );
}

export async function saveCustomModelFile(
  file: File | null | undefined,
): Promise<{ saved?: SavedCustomModel; error?: string }> {
  if (!file || file.size === 0 || !file.name) {
    return {};
  }

  const ext = extensionOf(file.name);
  if (!(CUSTOM_MODEL_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      error: "Dozwolone formaty modelu: STL, OBJ, 3MF.",
    };
  }

  if (file.size > CUSTOM_MODEL_MAX_BYTES) {
    return {
      error: `Plik modelu jest za duży (max ${Math.round(CUSTOM_MODEL_MAX_BYTES / (1024 * 1024))} MB).`,
    };
  }

  const safeName = `${randomUUID()}-${sanitizeBaseName(file.name)}${ext}`;
  const relativeUrl = `/uploads/custom/${safeName}`;
  const absoluteDir = path.join(process.cwd(), "public", "uploads", "custom");
  const absolutePath = path.join(absoluteDir, safeName);

  await mkdir(absoluteDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    saved: {
      modelFileName: file.name,
      modelFilePath: relativeUrl,
      modelFileSize: file.size,
    },
  };
}
