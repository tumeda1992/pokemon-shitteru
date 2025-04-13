import { useState } from "react";

import { createRoom } from "@/frontend/api/rooms";

export type UseCreateRoom = {
  error: string;
  roomCode: string;
  isLoading: boolean;
  createRoom: (generationId: string) => Promise<void>;
};

export function useCreateRoom(): UseCreateRoom {
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (generationId: string): Promise<void> => {
    setError("");
    setRoomCode("");
    setIsLoading(true);

    try {
      const response = await createRoom(generationId);
      setRoomCode(response.roomCode);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ルームの作成に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    roomCode,
    isLoading,
    createRoom: handleCreateRoom,
  };
}
