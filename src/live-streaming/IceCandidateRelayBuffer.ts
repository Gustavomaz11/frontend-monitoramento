export type LocalIceCandidate = {
  sessionId: string;
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number;
};

export class IceCandidateRelayBuffer {
  private active = false;
  private pending: LocalIceCandidate[] = [];
  private relayChain: Promise<void> = Promise.resolve();

  constructor(private readonly relay: (candidate: LocalIceCandidate) => Promise<void>) {}

  add(candidate: LocalIceCandidate): Promise<void> {
    if (!this.active) {
      this.pending.push(candidate);
      return Promise.resolve();
    }

    return this.enqueue(candidate);
  }

  async activate(): Promise<void> {
    if (this.active) return this.relayChain;
    this.active = true;

    const candidates = this.pending.splice(0);
    candidates.forEach((candidate) => this.enqueue(candidate));
    await this.relayChain;
  }

  reset() {
    this.active = false;
    this.pending = [];
    this.relayChain = Promise.resolve();
  }

  private enqueue(candidate: LocalIceCandidate): Promise<void> {
    const relay = this.relayChain.then(() => this.relay(candidate));
    this.relayChain = relay.catch(() => undefined);
    return relay;
  }
}
