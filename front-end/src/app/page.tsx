"use client";

import Image from "next/image";
import { Button, Input, Modal, Space } from "antd";

const { Search } = Input;
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
let code = uuidv4();
//import logo from "/logo.png";

export default function Home() {
  const router = useRouter();

  const [valueCode, setValueCode] = useState(code);

  const [isJoinRoom, setIsJoinRoom] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    //console.log("useEffect has been called!");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      router.push("/login");
    }
  });

  const username = localStorage.getItem("username");
  const display_name = localStorage.getItem("display_name");

  const handleChange = (event: any) => {
    setValueCode(event.target.value);
    console.log("value is:", event.target.value);
  };

  const onJoin = () => {
    setValueCode("code");
    setIsJoinRoom(true);
  };

  const onCreate = () => {
    setValueCode(uuidv4());
    setIsJoinRoom(false);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };
  async function onSubmit() {
    if (isJoinRoom)
      try {
        const response = await fetch(
          `${process.env.API_DEV}/meeting/check-not-exist-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: valueCode,
            }),
          }
        );
        const data = await response.json();
        console.log("Success:", data);
        if (!data.success && valueCode != "") {
          const url = `${"room.html"}?room=${valueCode}`;
          router.push(url);
        } else {
          setIsModalOpen(true);
        }
      } catch (error) {
        // Handle error if necessary
        console.error(error);
      }
    else {
      const url = `${"room.html"}?room=${valueCode}`;
      router.push(url);
    }
  }

  const logout = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("display_name");
    localStorage.removeItem("username");
    localStorage.removeItem("uid");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Modal
        title="Notification"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleOk}
      >
        Code is not exists
      </Modal>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Hi, welcome {display_name} to smeeting...
        </div>
        <div>
          <button
            className="bg-white mr-5 hover:bg-slate-200 rounded-lg border-inherit h-10 w-40
          transition ease-in-out font-bold hover:-translate-y-1 hover:scale-110"
            onClick={logout}
          >
            <Link href="/login">Logout</Link>
          </button>
          <button
            className="bg-white mr-5 hover:bg-slate-200 rounded-lg border-inherit h-10 w-40
          transition ease-in-out  hover:-translate-y-1 hover:scale-110"
          >
            Account : {username}
          </button>
        </div>
      </div>
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="animate-pulse relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/logo.png"
          alt="Next.js Logo"
          width={400}
          height={37}
          priority
        />
      </div>
      <div className="w-2/5 ">
        <p>Code meeting</p>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            name="codeInput"
            defaultValue={code}
            onChange={handleChange}
            value={valueCode}
            disabled={!isJoinRoom}
          />
          <Button type="primary" className="bg-black" onClick={onJoin}>
            {/* <Link
              href={{
                pathname: "/room.html",
                query: { room: code },
              }}
            >
              Join room
            </Link> */}
            Join room
          </Button>
          <Button type="primary" className="bg-black" onClick={onCreate}>
            Create room
          </Button>

          <Button
            type="primary"
            className="bg-rose-500 w-[300px]"
            onClick={onSubmit}
          >
            {/* <Link
              href={{
                pathname: "/room.html",
                query: { room: valueCode },
              }}
            >
            </Link> */}
            Enter room
          </Button>
        </Space.Compact>
      </div>
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
    </main>
  );
}
