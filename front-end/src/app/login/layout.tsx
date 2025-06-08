import { Layout } from "antd";
import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Loading from "./loading";

const inter = Inter({ subsets: ["latin"] });

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      <Suspense fallback={<Loading></Loading>}>{children}</Suspense>
    </Layout>
  );
}
