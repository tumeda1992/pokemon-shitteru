import { NextRequest } from "next/server";
import { describe, it, expect, vi } from "vitest";

import { GetRoomParticipantsQuery } from "@/backend/domain/room/queries/GetRoomParticipantsQuery";
import { RoomRepository } from "@/backend/domain/room/repositories/RoomRepository";
import testWithDb from "@/backend/test/helpers/testWithDb";

import { GET } from "./route";

// モックの作成
vi.mock("@/backend/domain/room/queries/GetRoomParticipantsQuery");
vi.mock("@/backend/domain/room/repositories/RoomRepository");

describe("GET /api/rooms/[roomCode]/participants", () => {
  testWithDb(async (_) => {
    it("ルームの参加者一覧を取得できる", async () => {
      // モックの設定
      const mockRoomRepository = new RoomRepository();
      const _mockQuery = new GetRoomParticipantsQuery(mockRoomRepository);

      vi.mocked(GetRoomParticipantsQuery.prototype.execute).mockResolvedValue([
        {
          id: 1,
          nickname: "参加者1",
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        },
        {
          id: 2,
          nickname: "参加者2",
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        },
      ]);

      // リクエストの作成
      const request = new NextRequest(
        "http://localhost:3000/api/rooms/ABC123/participants",
        {
          method: "GET",
        }
      );

      // APIの呼び出し
      const response = await GET(request, {
        params: {
          roomCode: "ABC123",
        },
      });
      const data = await response.json();

      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(data).toEqual({
        participants: [
          {
            id: 1,
            nickname: "参加者1",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
          {
            id: 2,
            nickname: "参加者2",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      });
    });

    it("ルームが存在しない場合はエラーを返す", async () => {
      // モックの設定
      const mockRoomRepository = new RoomRepository();
      const _mockQuery = new GetRoomParticipantsQuery(mockRoomRepository);

      vi.mocked(GetRoomParticipantsQuery.prototype.execute).mockRejectedValue(
        new Error("ルームが見つかりません")
      );

      // リクエストの作成
      const request = new NextRequest(
        "http://localhost:3000/api/rooms/NONEXISTENT/participants",
        {
          method: "GET",
        }
      );

      // APIの呼び出し
      const response = await GET(request, {
        params: {
          roomCode: "NONEXISTENT",
        },
      });
      const data = await response.json();

      // レスポンスの検証
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "ルームが見つかりません" });
    });

    it("ルームの有効期限が切れている場合はエラーを返す", async () => {
      // モックの設定
      const mockRoomRepository = new RoomRepository();
      const _mockQuery = new GetRoomParticipantsQuery(mockRoomRepository);

      vi.mocked(GetRoomParticipantsQuery.prototype.execute).mockRejectedValue(
        new Error("ルームの有効期限が切れています")
      );

      // リクエストの作成
      const request = new NextRequest(
        "http://localhost:3000/api/rooms/ABC123/participants",
        {
          method: "GET",
        }
      );

      // APIの呼び出し
      const response = await GET(request, {
        params: {
          roomCode: "ABC123",
        },
      });
      const data = await response.json();

      // レスポンスの検証
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "ルームの有効期限が切れています" });
    });
  });
});
