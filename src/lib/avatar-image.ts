import "server-only";
import sharp from "sharp";
export async function prepareAvatar(file: File): Promise<Buffer> {
  const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 16_000_000, animated: false });
  const metadata = await image.metadata();
  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) throw new Error("Invalid photo");
  const output = await image.rotate().resize(256, 256, { fit: "cover" }).webp({ quality: 75 }).toBuffer();
  if (output.length > 64 * 1024) throw new Error("Photo is too complex");
  return output;
}
