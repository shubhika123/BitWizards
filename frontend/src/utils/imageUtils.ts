/**
 * imageUtils.ts
 *
 * Shared image-handling utilities for the AI Virtual Try-On pipeline.
 * These helpers bridge browser file handling and the IDM-VTON Gradio API.
 */

/**
 * Fetches a remote (or local object-URL) image and returns it as a `Blob`.
 *
 * Used to convert product catalogue images and user-uploaded photos into the
 * `Blob` format expected by `@gradio/client` before submitting them to the
 * IDM-VTON inference endpoint.
 *
 * @param imagePath  Absolute URL, relative URL, or `blob:` / `data:` URI of
 *                   the image to fetch.
 * @returns          A `Promise` that resolves to the raw image `Blob`.
 * @throws           Re-throws any network or HTTP error encountered so callers
 *                   can surface a meaningful message to the user.
 *
 * @example
 * const blob = await fetchImageAsBlob("https://cdn.example.com/shirt.jpg");
 * // blob is ready to pass directly to the Gradio client predict() call
 */
export async function fetchImageAsBlob(imagePath: string): Promise<Blob> {
  let response: Response;

  try {
    response = await fetch(imagePath);
    
    // If request failed with 404 and is a catalog image, try alternate extensions (.jpg <-> .png)
    if (!response.ok && response.status === 404 && imagePath.includes("/catalog/")) {
      let altPath = "";
      if (imagePath.endsWith(".png")) {
        altPath = imagePath.substring(0, imagePath.length - 4) + ".jpg";
      } else if (imagePath.endsWith(".jpg")) {
        altPath = imagePath.substring(0, imagePath.length - 4) + ".png";
      } else if (imagePath.endsWith(".jpeg")) {
        altPath = imagePath.substring(0, imagePath.length - 5) + ".png";
      }
      
      if (altPath) {
        try {
          const altResponse = await fetch(altPath);
          if (altResponse.ok) {
            response = altResponse;
          }
        } catch (_) {
          // Ignore and keep the original response
        }
      }
    }
  } catch (networkError) {
    throw new Error(
      `[fetchImageAsBlob] Network request failed for "${imagePath}": ${
        networkError instanceof Error ? networkError.message : String(networkError)
      }`
    );
  }


  if (!response.ok) {
    throw new Error(
      `[fetchImageAsBlob] Server returned ${response.status} ${response.statusText} for "${imagePath}"`
    );
  }

  try {
    return await response.blob();
  } catch (blobError) {
    throw new Error(
      `[fetchImageAsBlob] Failed to read response body as Blob for "${imagePath}": ${
        blobError instanceof Error ? blobError.message : String(blobError)
      }`
    );
  }
}
