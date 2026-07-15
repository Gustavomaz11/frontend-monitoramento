import * as signalR from '@microsoft/signalr';
import { parentApi } from '../api/parentApi';
import { apiBaseUrl, getAuthenticatedAccessToken } from '../api/httpClient';
import { HubConnectionCoordinator } from './HubConnectionCoordinator';
import { IceCandidateRelayBuffer } from './IceCandidateRelayBuffer';

export type LiveStreamSource = 'camera_front' | 'camera_back' | 'screen';
export type LiveStreamState = 'connecting' | 'requesting' | 'streaming' | 'stopped' | 'error';

type LiveStreamClientEvents = {
  onStateChanged: (state: LiveStreamState, message: string) => void;
  onRemoteStream: (stream: MediaStream | null) => void;
  onDevicePresenceChanged: (deviceId: string, online: boolean) => void;
};

export class LiveStreamClient {
  private readonly connection: signalR.HubConnection;
  private peerConnection: RTCPeerConnection | null = null;
  private sessionId: string | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private requestTimeoutId: number | null = null;
  private readonly localCandidates: IceCandidateRelayBuffer;
  private readonly connectionCoordinator: HubConnectionCoordinator;

  constructor(private readonly events: LiveStreamClientEvents) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/live-stream`, {
        accessTokenFactory: getAuthenticatedAccessToken,
      })
      .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 30_000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
    this.connectionCoordinator = new HubConnectionCoordinator(
      () => this.connection.state,
      async () => {
        this.events.onStateChanged('connecting', 'Conectando ao dispositivo...');
        await this.connection.start();
        this.events.onStateChanged('stopped', 'Canal ao vivo conectado.');
      },
    );
    this.localCandidates = new IceCandidateRelayBuffer(async (candidate) => {
      if (this.connection.state !== signalR.HubConnectionState.Connected || this.sessionId !== candidate.sessionId) return;
      await this.connection.invoke(
        'RelayIceCandidate',
        candidate.sessionId,
        candidate.candidate,
        candidate.sdpMid,
        candidate.sdpMLineIndex,
      );
    });

    this.registerHubEvents();
  }

  async connect() {
    await this.connectionCoordinator.connect();
  }

  async getDevicePresence(deviceId: string): Promise<boolean> {
    await this.connect();
    return this.connection.invoke<boolean>('GetDevicePresence', deviceId);
  }

  async start(deviceId: string, source: LiveStreamSource) {
    await this.connect();
    await this.stop();

    const configuration = await parentApi.getLiveStreamConfiguration();
    const sessionId = crypto.randomUUID();
    const peerConnection = new RTCPeerConnection({
      iceServers: configuration.iceServers.map((server) => ({
        urls: server.urls,
        username: server.username ?? undefined,
        credential: server.credential ?? undefined,
      })),
    });

    this.sessionId = sessionId;
    this.peerConnection = peerConnection;
    this.pendingCandidates = [];
    this.localCandidates.reset();
    this.configurePeerConnection(peerConnection, sessionId);
    peerConnection.addTransceiver('video', { direction: 'recvonly' });

    this.events.onStateChanged('requesting', 'Solicitando transmissao ao celular...');
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await this.connection.invoke('RequestStream', deviceId, sessionId, source, offer.sdp);
      await this.localCandidates.activate();
      this.requestTimeoutId = window.setTimeout(() => {
        if (this.sessionId !== sessionId) return;
        void this.stop().finally(() => {
          this.events.onStateChanged('error', 'O celular nao respondeu ao pedido de transmissao.');
        });
      }, 30_000);
    } catch (error) {
      this.disposePeerConnection();
      throw error;
    }
  }

  async stop() {
    const sessionId = this.sessionId;
    this.disposePeerConnection();
    if (sessionId && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('StopStream', sessionId).catch(() => undefined);
    }
  }

  async disconnect() {
    await this.stop();
    if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
      await this.connection.stop();
    }
  }

  private configurePeerConnection(peerConnection: RTCPeerConnection, sessionId: string) {
    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || this.sessionId !== sessionId) return;
      void this.localCandidates.add({
        sessionId,
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex ?? 0,
      }).catch(() => {
        if (this.sessionId === sessionId) {
          this.events.onStateChanged('error', 'Falha ao enviar os dados de conexao de video.');
        }
      });
    };

    peerConnection.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.events.onRemoteStream(stream);
      this.clearRequestTimeout();
      this.events.onStateChanged('streaming', 'Transmissao ao vivo.');
    };

    peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection !== peerConnection) return;
      if (peerConnection.connectionState === 'connected') {
        this.clearRequestTimeout();
        this.events.onStateChanged('streaming', 'Transmissao ao vivo.');
      }
      if (['failed', 'disconnected'].includes(peerConnection.connectionState)) {
        this.events.onStateChanged('error', 'A conexao de video foi interrompida.');
      }
    };
  }

  private registerHubEvents() {
    this.connection.on('StreamAnswer', async (sessionId: string, answerSdp: string) => {
      if (sessionId !== this.sessionId || !this.peerConnection) return;
      await this.peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      const candidates = this.pendingCandidates.splice(0);
      await Promise.all(candidates.map((candidate) => this.peerConnection?.addIceCandidate(candidate)));
    });

    this.connection.on(
      'IceCandidate',
      async (sessionId: string, candidate: string, sdpMid: string | null, sdpMLineIndex: number) => {
        if (sessionId !== this.sessionId || !this.peerConnection) return;
        const iceCandidate = { candidate, sdpMid, sdpMLineIndex };
        if (!this.peerConnection.remoteDescription) {
          this.pendingCandidates.push(iceCandidate);
          return;
        }
        await this.peerConnection.addIceCandidate(iceCandidate);
      },
    );

    this.connection.on('StreamRejected', (sessionId: string, reason: string) => {
      if (sessionId !== this.sessionId) return;
      this.disposePeerConnection();
      this.events.onStateChanged('error', this.rejectionMessage(reason));
    });

    this.connection.on('StreamEnded', (sessionId: string) => {
      if (sessionId !== this.sessionId) return;
      this.disposePeerConnection();
      this.events.onStateChanged('stopped', 'Transmissao encerrada.');
    });

    this.connection.on('DevicePresenceChanged', (deviceId: string, online: boolean) => {
      this.events.onDevicePresenceChanged(deviceId, online);
    });

    this.connection.onreconnecting(() => {
      this.disposePeerConnection();
      this.events.onStateChanged('connecting', 'Reconectando o canal ao vivo...');
    });
    this.connection.onreconnected(() => {
      this.events.onStateChanged('stopped', 'Canal ao vivo reconectado.');
    });
    this.connection.onclose(() => {
      this.disposePeerConnection();
      this.events.onStateChanged('error', 'Canal ao vivo desconectado.');
    });
  }

  private rejectionMessage(reason: string) {
    const messages: Record<string, string> = {
      monitoring_disabled: 'Ative o monitoramento ao vivo no celular.',
      screen_permission_missing: 'A permissao de captura de tela precisa ser concedida no celular.',
      camera_permission_missing: 'A permissao da camera precisa ser concedida no celular.',
      busy: 'O celular ja esta transmitindo para outra sessao.',
      unavailable: 'O celular nao conseguiu iniciar a transmissao.',
    };
    return messages[reason] ?? `Transmissao recusada pelo celular: ${reason}`;
  }

  private disposePeerConnection() {
    this.clearRequestTimeout();
    this.peerConnection?.close();
    this.peerConnection = null;
    this.sessionId = null;
    this.pendingCandidates = [];
    this.localCandidates.reset();
    this.events.onRemoteStream(null);
  }

  private clearRequestTimeout() {
    if (this.requestTimeoutId === null) return;
    window.clearTimeout(this.requestTimeoutId);
    this.requestTimeoutId = null;
  }
}
