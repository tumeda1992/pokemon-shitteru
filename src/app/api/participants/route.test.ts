import { NextRequest } from "next/server";
import { describe, it, expect, vi } from "vitest";

import { CreateParticipantCommand } from "@/backend/domain/participant/commands/CreateParticipantCommand";
import { ParticipantRepository } from "@/backend/domain/participant/repositories/ParticipantRepository";
import testWithDb from "@/backend/test/helpers/testWithDb";

import { POST } from "./route";

// モックの作成
vi.mock("@/backend/domain/participant/commands/CreateParticipantCommand");
vi.mock("@/backend/domain/participant/repositories/ParticipantRepository");

describe("POST /api/participants", () => {
  testWithDb(async (_) => {
    it("新しい参加者を作成できる", async () => {
      // モックの設定
      const createdAt = new Date();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const mockParticipant = {
        id: 1,
        nickname: "テストユーザー",
        sessionId: "test-session-id",
        createdAt,
        expiresAt,
      };

      const mockRepository = new ParticipantRepository();
      const _mockCommand = new CreateParticipantCommand(mockRepository);

      vi.mocked(CreateParticipantCommand.prototype.execute).mockResolvedValue(
        mockParticipant
      );

      // リクエストの作成
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: JSON.stringify({ nickname: "テストユーザー" }),
        }
      );

      // APIの呼び出し
      const response = await POST(request);
      const data = await response.json();

      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(data.id).toBe(mockParticipant.id);
      expect(data.nickname).toBe(mockParticipant.nickname);
      expect(data.sessionId).toBe(mockParticipant.sessionId);
      expect(new Date(data.createdAt)).toEqual(mockParticipant.createdAt);
      expect(new Date(data.expiresAt)).toEqual(mockParticipant.expiresAt);
      expect(CreateParticipantCommand.prototype.execute).toHaveBeenCalledWith({
        nickname: "テストユーザー",
      });
    });

    it("ニックネームが空の場合はエラーを返す", async () => {
      // モックの設定
      vi.mocked(CreateParticipantCommand.prototype.execute).mockRejectedValue(
        new Error("ニックネームは必須です")
      );

      // リクエストの作成
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: JSON.stringify({ nickname: "" }),
        }
      );

      // APIの呼び出し
      const response = await POST(request);
      const data = await response.json();

      // レスポンスの検証
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "ニックネームは必須です" });
    });

    it("リクエストボディが不正な場合はエラーを返す", async () => {
      // リクエストの作成
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: "invalid json",
        }
      );

      // APIの呼び出し
      const response = await POST(request);
      const data = await response.json();

      // レスポンスの検証
      expect(response.status).toBe(400);
      expect(data.error).toContain("Unexpected token");
    });
  });
});
