"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";

const NewParticipantPage = (): ReactElement => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("ニックネームは必須です");
      return;
    }

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "参加者の作成に失敗しました");
      }

      await response.json();
      router.push("/rooms");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("予期せぬエラーが発生しました");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            参加者情報の入力
          </h2>
        </div>
        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          data-testid="participant-form"
        >
          <div>
            <label htmlFor="nickname" className="sr-only">
              ニックネーム
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="ニックネームを入力"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              参加する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewParticipantPage;
