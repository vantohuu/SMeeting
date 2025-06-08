"use client";
import { AndroidOutlined, AppleOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import LoginCom from "@/components/login";
import Register from "@/components/register";
import Image from "next/image";
const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Login",
    children: <LoginCom></LoginCom>,
  },
  {
    key: "2",
    label: "Register",
    children: <Register></Register>,
  },
];

export default function Login() {
  return (
    <>
      <main className="flex h-screen flex-col items-center justify-between p-20">
        <div className="bg-black/5  hover:bg-black/20 h-6/7 w-2/5 rounded-xl flex  flex-col items-center justify-between p-10">
          <div className="mb-5">
            <Image
              className="animate-pulse relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
              src="/logo.png"
              alt="Next.js Logo"
              width={120}
              height={37}
              priority
            />
          </div>

          <Tabs size="large" onChange={onChange} type="card" items={items} />
        </div>
      </main>
    </>
  );
}
