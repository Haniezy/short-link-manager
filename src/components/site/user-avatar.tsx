"use client";

import Image from "next/image";
import { useState } from "react";

export function UserAvatar({ name, image, size = 32 }: { name: string; image?: string | null; size?: number }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const valid = image?.startsWith("https://") && failedUrl !== image;
  return <span className="user-avatar" style={{ width: size, height: size }} aria-hidden="true">
    {valid && image ? <Image src={image} alt="" width={size} height={size} unoptimized referrerPolicy="no-referrer" onError={() => setFailedUrl(image)} /> : name.slice(0, 1).toUpperCase()}
  </span>;
}
