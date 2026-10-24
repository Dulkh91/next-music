import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "បញ្ចូលចម្រៀង",
  description: "បញ្ចូលបទចម្រៀងថ្មីទៅក្នុងបណ្ណាល័យតន្ត្រី។",
};

export default function UploadLayout({ children }: LayoutProps<"/upload">) {
  return children;
}
