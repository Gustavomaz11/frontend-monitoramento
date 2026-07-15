import { describe, expect, it, vi } from 'vitest';
import { IceCandidateRelayBuffer, type LocalIceCandidate } from './IceCandidateRelayBuffer';

const candidate = (value: string): LocalIceCandidate => ({
  sessionId: 'session-1',
  candidate: value,
  sdpMid: '0',
  sdpMLineIndex: 0,
});

describe('IceCandidateRelayBuffer', () => {
  it('retains candidates until the backend stream session is registered', async () => {
    const relay = vi.fn<(value: LocalIceCandidate) => Promise<void>>().mockResolvedValue(undefined);
    const buffer = new IceCandidateRelayBuffer(relay);

    await buffer.add(candidate('candidate-before-request'));
    expect(relay).not.toHaveBeenCalled();

    await buffer.activate();
    expect(relay).toHaveBeenCalledWith(candidate('candidate-before-request'));
  });

  it('relays candidates generated after activation immediately and in order', async () => {
    const relayed: string[] = [];
    const buffer = new IceCandidateRelayBuffer(async (value) => {
      relayed.push(value.candidate);
    });

    await buffer.activate();
    await Promise.all([
      buffer.add(candidate('candidate-1')),
      buffer.add(candidate('candidate-2')),
    ]);

    expect(relayed).toEqual(['candidate-1', 'candidate-2']);
  });

  it('drops candidates from the previous session when reset', async () => {
    const relay = vi.fn<(value: LocalIceCandidate) => Promise<void>>().mockResolvedValue(undefined);
    const buffer = new IceCandidateRelayBuffer(relay);

    await buffer.add(candidate('stale-candidate'));
    buffer.reset();
    await buffer.activate();

    expect(relay).not.toHaveBeenCalled();
  });
});
