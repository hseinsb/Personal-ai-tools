"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    const result = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/",
      username,
      password,
    });

    if (!result.ok) {
      alert("Login failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl mb-4">Admin Login</h1>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="mb-3 p-2 border rounded w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="mb-3 p-2 border rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}
