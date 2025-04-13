import { useState } from "react";

export type UseJoinRoom = {
  error: string;
  isLoading: boolean;
  joinRoom: (roomCode: string, participantId: number) => Promise<void>;
};

export const useJoinRoom = (): UseJoinRoom => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const joinRoom = async (
    roomCode: string,
    participantId: number
  ): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/rooms/${roomCode}/participants/${participantId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.error);
        return;
      }
    } catch (_e) {
      setError("予期せぬエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    joinRoom,
  };
};
