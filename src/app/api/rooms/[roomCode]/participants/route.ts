import { NextResponse } from "next/server";

import { GetRoomParticipantsQuery } from "@/backend/domain/room/queries/GetRoomParticipantsQuery";
import { RoomRepository } from "@/backend/domain/room/repositories/RoomRepository";

import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomCode: string } }
): Promise<NextResponse> {
  try {
    const roomRepository = new RoomRepository();
    const query = new GetRoomParticipantsQuery(roomRepository);

    const participants = await query.execute({
      roomCode: params.roomCode,
    });

    return NextResponse.json({ participants }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ルームが見つかりません") {
        return NextResponse.json(
          { error: "ルームが見つかりません" },
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
