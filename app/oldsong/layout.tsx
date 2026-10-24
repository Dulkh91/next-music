import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ចម្រៀងបុរាណ",
  description: "ស្តាប់បទចម្រៀងខ្មែរបុរាណ។",
};

export default function OldSongLayout({ children }: LayoutProps<"/oldsong">) {
  return children;
}
