export type CoordinatedConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting' | 'Disconnecting';

export class HubConnectionCoordinator {
  private connectionAttempt: Promise<void> | null = null;

  constructor(
    private readonly readState: () => CoordinatedConnectionState,
    private readonly start: () => Promise<void>,
    private readonly stop: () => Promise<void> = () => Promise.resolve(),
  ) {}

  connect(): Promise<void> {
    if (this.readState() === 'Connected') return Promise.resolve();
    if (this.connectionAttempt) return this.connectionAttempt;
    if (this.readState() !== 'Disconnected') {
      return Promise.reject(new Error('A conexao ao canal ao vivo ainda esta mudando de estado.'));
    }

    const startAttempt = Promise.resolve().then(this.start);
    const trackedAttempt = startAttempt.finally(() => {
      if (this.connectionAttempt === trackedAttempt) this.connectionAttempt = null;
    });
    this.connectionAttempt = trackedAttempt;
    return trackedAttempt;
  }

  async reconnect(): Promise<void> {
    await this.connectionAttempt?.catch(() => undefined);
    if (this.readState() !== 'Disconnected') await this.stop();
    await this.connect();
  }
}
