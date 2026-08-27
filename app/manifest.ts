import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Listy - Shopping List",
    short_name: "Listy",
    description: "รายการสั่งซื้อของคุณ",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F5FB",
    theme_color: "#6D28D9",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
