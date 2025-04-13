import { NextResponse } from "next/server";

import { ParticipantRepository } from "@/backend/domain/participant/repositories/ParticipantRepository";
import { JoinRoomCommand } from "@/backend/domain/room/commands/JoinRoomCommand";
import { RoomRepository } from "@/backend/domain/room/repositories/RoomRepository";

import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { roomCode: string; participantId: string } }
): Promise<NextResponse> {
  try {
    const roomRepository = new RoomRepository();
    const participantRepository = new ParticipantRepository();
    const command = new JoinRoomCommand(roomRepository, participantRepository);

    await command.execute({
      roomCode: params.roomCode,
      participantId: parseInt(params.participantId, 10),
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ルームが見つかりません") {
        return NextResponse.json(
          { error: "ルームが見つかりません" },
          { status: 404 }
        );
      }
      if (error.message === "参加者が見つかりません") {
        return NextResponse.json(
          { error: "参加者が見つかりません" },
          { status: 404 }
        );
      }
      if (error.message === "ルームの有効期限が切れています") {
        return NextResponse.json(
          { error: "ルームの有効期限が切れています" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}
