import type { ParticipantRepository } from "../repositories/ParticipantRepository";
import type { Participant } from "../types";

export class GetParticipantQuery {
  constructor(private repository: ParticipantRepository) {}

  async execute(params: { sessionId: string }): Promise<Participant | null> {
    return this.repository.findBySessionId(params.sessionId);
  }
}
