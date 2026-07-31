"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  required?: boolean;
}

export function ProductImageUpload({
  value,
  onChange,
  onUploadingChange,
  required = false,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Seleccioná una imagen JPG, PNG o WebP");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("La imagen no puede superar los 4 MB");
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setError("");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo subir la imagen");
      }

      onChange(data.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la imagen"
      );
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="field">
      <label>Imagen del producto</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required && !value}
        disabled={uploading}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <p className="admin-field-help">
        JPG, PNG o WebP · máximo 4 MB
      </p>

      {uploading && <p className="admin-upload-status">Subiendo imagen…</p>}
      {error && <p className="admin-field-error">{error}</p>}

      {value && (
        <div className="admin-image-preview">
          <Image
            src={value}
            alt="Vista previa del producto"
            width={160}
            height={200}
          />
          <button type="button" onClick={() => onChange("")}>
            Quitar imagen
          </button>
        </div>
      )}
    </div>
  );
}
