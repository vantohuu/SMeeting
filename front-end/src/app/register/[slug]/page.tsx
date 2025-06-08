"use client";
import { AndroidOutlined, AppleOutlined } from "@ant-design/icons";
import LoginCom from "@/components/login";
import Register from "@/components/register";
import { useRouter } from "next/navigation";

import Image from "next/image";
import {
  Button,
  DatePicker,
  DatePickerProps,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import { FormEvent, useEffect, useState } from "react";
import moment from "moment";

const { Option } = Select;

type FieldType = {
  firstname?: string;
  lastname?: string;
  bod?: any;
  sex?: Number;
  phone?: string;
};

const onChange = (key: string) => {
  console.log(key);
};
let d: string;
const onChangeDatePiker: DatePickerProps["onChange"] = (date, dateString) => {
  console.log(date, dateString);
  d = moment(dateString).format("MM/DD/yyyy");
  console.log(moment(dateString).format("DD/MM/yyyy"));
};
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const validateMessages = {
  required: "${label} is required!",
  types: {
    email: "${label} is not a valid email!",
    number: "${label} is not a valid number!",
  },
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};
/* eslint-enable no-template-curly-in-string */

const onFinish = (values: any) => {
  console.log(values);
};

export default function Infor({ params }: { params: { slug: string } }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const router = useRouter();

  const [form] = Form.useForm();
  console.log(params);
  const userName = params.slug;
  const firstName = Form.useWatch("firstname", form);
  const lastName = Form.useWatch("lastname", form);
  const dob = Form.useWatch("dob", form);
  const phone = Form.useWatch("phone", form);
  const sex = Form.useWatch("sex", form);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
    }
  });
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    console.log(dob);
    try {
      const body = JSON.stringify({
        username: userName,
        firstName: firstName,
        lastName: lastName,
        dob: d,
        phone: phone,
        sex: sex,
      });
      console.log("body", body);
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${process.env.API_DEV}/user/update-infor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          x_authorization: `${accessToken}`,
        },

        body,
      });
      const data = await response.json();
      console.log("Success:", data);
      setIsSuccess(data.success);
      if (data.success) {
        router.push("/");
      }
    } catch (error) {
      // Handle error if necessary
      console.error(error);
    } finally {
      setIsLoading(false); // Set loading to false when the request completes
    }
  }

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
          {/* <p>Post: {router.query.slug}</p> */}
          <div className="flex  flex-col items-center justify-between bg-white p-10 bg-opacity-80 rounded-lg">
            <p className="mb-5">PERSONAL INFORMATION</p>

            <Form
              {...layout}
              name="infor"
              onFinish={onFinish}
              style={{ maxWidth: 600 }}
              validateMessages={validateMessages}
              onSubmitCapture={onSubmit}
              form={form}
            >
              <Form.Item<FieldType>
                name="firstname"
                label="First name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<FieldType>
                name="lastname"
                label="Last name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<FieldType>
                name="bod"
                label="Date of birth:"
                rules={[{ required: true }]}
              >
                <DatePicker onChange={onChangeDatePiker} />
              </Form.Item>

              <Form.Item<FieldType> name="phone" label="Phone">
                <Input />
              </Form.Item>

              <Form.Item<FieldType>
                name="sex"
                label="Sex"
                rules={[{ required: true, message: "Sex is required" }]}
              >
                <Select placeholder="Sex">
                  <Option value={1}>Male</Option>
                  <Option value={0}>Female</Option>
                </Select>
              </Form.Item>
              <p
                className={
                  isSuccess ? "text-green-500 mb-5" : "text-rose-600 mb-5"
                }
              >
                {isSuccess ? "" : "Error : unauthorized"}
              </p>
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-black/80"
                  loading={isLoading}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </main>
    </>
  );
}
