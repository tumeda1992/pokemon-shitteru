import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { describe, it, expect, vi, beforeEach } from "vitest";

import testWithDb from "@/backend/test/helpers/testWithDb";

import NewParticipantPage from "./page";

// モックの作成
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("NewParticipantPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  testWithDb(async (_) => {
    it("ニックネームを入力して参加者を作成できる", async () => {
      // モックの設定
      const mockRouter = {
        push: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
      };
      vi.mocked(useRouter).mockReturnValue(mockRouter);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, nickname: "テストユーザー" }),
      });

      // コンポーネントのレンダリング
      render(<NewParticipantPage />);

      // フォームの入力
      const input = screen.getByPlaceholderText("ニックネームを入力");
      fireEvent.change(input, { target: { value: "テストユーザー" } });

      // フォームの送信
      const form = screen.getByTestId("participant-form");
      fireEvent.submit(form);

      // APIリクエストの検証
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/participants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname: "テストユーザー" }),
        });
      });

      // リダイレクトの検証
      expect(mockRouter.push).toHaveBeenCalledWith("/rooms");
    });

    it("ニックネームが空の場合はエラーメッセージを表示する", async () => {
      // モックの設定
      const mockRouter = {
        push: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
      };
      vi.mocked(useRouter).mockReturnValue(mockRouter);

      // コンポーネントのレンダリング
      render(<NewParticipantPage />);

      // フォームの送信
      const form = screen.getByTestId("participant-form");
      fireEvent.submit(form);

      // エラーメッセージの検証
      await waitFor(() => {
        expect(screen.getByText("ニックネームは必須です")).toBeInTheDocument();
      });
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it("APIエラーの場合はエラーメッセージを表示する", async () => {
      // モックの設定
      const mockRouter = {
        push: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
      };
      vi.mocked(useRouter).mockReturnValue(mockRouter);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "参加者の作成に失敗しました" }),
      });

      // コンポーネントのレンダリング
      render(<NewParticipantPage />);

      // フォームの入力
      const input = screen.getByPlaceholderText("ニックネームを入力");
      fireEvent.change(input, { target: { value: "テストユーザー" } });

      // フォームの送信
      const form = screen.getByTestId("participant-form");
      fireEvent.submit(form);

      // エラーメッセージの検証
      await waitFor(() => {
        expect(
          screen.getByText("参加者の作成に失敗しました")
        ).toBeInTheDocument();
      });
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
