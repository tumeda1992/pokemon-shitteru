import type { ParticipantRepository } from "@/backend/domain/participant/repositories/ParticipantRepository";
import type { RoomRepository } from "@/backend/domain/room/repositories/RoomRepository";

type JoinRoomCommandInput = {
  roomCode: string;
  participantId: number;
};

type JoinRoomCommandOutput = {
  roomCode: string;
  participantId: number;
};

export class JoinRoomCommand {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly participantRepository: ParticipantRepository
  ) {}

  async execute(input: JoinRoomCommandInput): Promise<JoinRoomCommandOutput> {
    const { roomCode, participantId } = input;

    // ルームの存在確認
    const room = await this.roomRepository.findByRoomCode(roomCode);
    if (!room) {
      throw new Error("ルームが見つかりません");
    }

    // 参加者の存在確認
    const participant = await this.participantRepository.findById(
      participantId
    );
    if (!participant) {
      throw new Error("参加者が見つかりません");
    }

    // 参加者がすでにルームに参加しているか確認
    const participants = await this.roomRepository.getParticipants(room);
    const isAlreadyJoined = participants.some((p) => p.id === participantId);
    if (isAlreadyJoined) {
      throw new Error("すでにルームに参加しています");
    }

    // ルームに参加者を追加
    await this.roomRepository.addParticipant(room, participant);

    return {
      roomCode: room.roomCode,
      participantId: participant.id,
    };
  }
}
