import { describe, expect, it, vi } from 'vitest';
import { HubConnectionCoordinator, type CoordinatedConnectionState } from './HubConnectionCoordinator';

describe('HubConnectionCoordinator', () => {
  it('makes concurrent callers wait for the same connection attempt', async () => {
    let state: CoordinatedConnectionState = 'Disconnected';
    let releaseConnection: (() => void) | undefined;
    const start = vi.fn(async () => {
      state = 'Connecting';
      await new Promise<void>((resolve) => { releaseConnection = resolve; });
      state = 'Connected';
    });
    const coordinator = new HubConnectionCoordinator(() => state, start);

    const first = coordinator.connect();
    const second = coordinator.connect();
    let secondCompleted = false;
    void second.then(() => { secondCompleted = true; });

    await Promise.resolve();
    expect(start).toHaveBeenCalledTimes(1);
    expect(secondCompleted).toBe(false);

    releaseConnection?.();
    await Promise.all([first, second]);
    expect(secondCompleted).toBe(true);
  });

  it('does not start a new connection when one is already connected', async () => {
    const start = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const coordinator = new HubConnectionCoordinator(() => 'Connected', start);

    await coordinator.connect();

    expect(start).not.toHaveBeenCalled();
  });

  it('replaces an apparently connected channel before a stream request', async () => {
    let state: CoordinatedConnectionState = 'Connected';
    const operations: string[] = [];
    const start = vi.fn(async () => {
      operations.push('start');
      state = 'Connected';
    });
    const stop = vi.fn(async () => {
      operations.push('stop');
      state = 'Disconnected';
    });
    const coordinator = new HubConnectionCoordinator(() => state, start, stop);

    await coordinator.reconnect();

    expect(operations).toEqual(['stop', 'start']);
  });
});
