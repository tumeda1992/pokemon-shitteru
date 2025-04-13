import { describe, it, expect } from "vitest";

import { ParticipantRepository } from "@/backend/domain/participant/repositories/ParticipantRepository";
import { RoomRepository } from "@/backend/domain/room/repositories/RoomRepository";
import testWithDb from "@/backend/test/helpers/testWithDb";

import { JoinRoomCommand } from "./JoinRoomCommand";

describe("JoinRoomCommand", () => {
  testWithDb(async (_prisma) => {
    it("should join a room with valid room code and participant id", async () => {
      const roomRepository = new RoomRepository();
      const participantRepository = new ParticipantRepository();
      const command = new JoinRoomCommand(
        roomRepository,
        participantRepository
      );

      // 事前準備：ルームと参加者を作成
      const room = await roomRepository.create({
        roomCode: "ABC123",
        quizConfig: {
          generationId: 1,
        },
      });
      const participant = await participantRepository.create({
        nickname: "テストユーザー",
        sessionId: "test-session-id",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      // コマンド実行
      const result = await command.execute({
        roomCode: room.roomCode,
        participantId: participant.id,
      });

      // 検証
      expect(result.roomCode).toBe(room.roomCode);
      expect(result.participantId).toBe(participant.id);

      // ルームに参加者が追加されていることを確認
      const participants = await roomRepository.getParticipants(room.id);
      expect(participants).toHaveLength(1);
      expect(participants[0].id).toBe(participant.id);
    });

    it("should throw error when room code is invalid", async () => {
      const roomRepository = new RoomRepository();
      const participantRepository = new ParticipantRepository();
      const command = new JoinRoomCommand(
        roomRepository,
        participantRepository
      );

      const participant = await participantRepository.create({
        nickname: "テストユーザー",
        sessionId: "test-session-id-2",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await expect(
        command.execute({
          roomCode: "invalid-code",
          participantId: participant.id,
        })
      ).rejects.toThrow("ルームが見つかりません");
    });

    it("should throw error when participant id is invalid", async () => {
      const roomRepository = new RoomRepository();
      const participantRepository = new ParticipantRepository();
      const command = new JoinRoomCommand(
        roomRepository,
        participantRepository
      );

      const room = await roomRepository.create({
        roomCode: "ABC123",
        quizConfig: {
          generationId: 1,
        },
      });

      await expect(
        command.execute({
          roomCode: room.roomCode,
          participantId: 999,
        })
      ).rejects.toThrow("参加者が見つかりません");
    });

    it("should throw error when participant is already in the room", async () => {
      const roomRepository = new RoomRepository();
      const participantRepository = new ParticipantRepository();
      const command = new JoinRoomCommand(
        roomRepository,
        participantRepository
      );

      const room = await roomRepository.create({
        roomCode: "ABC123",
        quizConfig: {
          generationId: 1,
        },
      });
      const participant = await participantRepository.create({
        nickname: "テストユーザー",
        sessionId: "test-session-id-3",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      // 1回目の参加
      await command.execute({
        roomCode: room.roomCode,
        participantId: participant.id,
      });

      // 2回目の参加（エラーになるはず）
      await expect(
        command.execute({
          roomCode: room.roomCode,
          participantId: participant.id,
        })
      ).rejects.toThrow("すでにルームに参加しています");
    });
  });
});
