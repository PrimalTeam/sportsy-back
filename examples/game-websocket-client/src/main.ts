import { Manager, Socket, type ManagerOptions } from 'socket.io-client';
import { backendUrl } from './config';

type GameEvent = {
  gameId?: number;
  tournamentId?: number;
  [key: string]: unknown;
};

type JoinPayload = { tournamentId: number; roomId: number; token?: string };
type TournamentResponse = {
  status: string;
  room?: string;
  message?: string;
};

type ServerToClientEvents = {
  gameCreated: (payload: GameEvent) => void;
  gameUpdated: (payload: GameEvent) => void;
  gameDeleted: (payload: { gameId: number; tournamentId: number }) => void;
};

type ClientToServerEvents = {
  joinTournament: (
    payload: JoinPayload,
    callback?: (response: TournamentResponse) => void,
  ) => void;
  leaveTournament: (
    payload: JoinPayload,
    callback?: (response: TournamentResponse) => void,
  ) => void;
};

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Failed to locate root element');
}

const statusEl = document.createElement('p');
const logsEl = document.createElement('pre');
logsEl.style.height = '300px';
logsEl.style.overflow = 'auto';
logsEl.style.background = '#1f1f1f';
logsEl.style.color = '#fafafa';
logsEl.style.padding = '12px';
logsEl.style.borderRadius = '8px';
logsEl.textContent = 'Event log will appear here.';

const lastPayloadEl = document.createElement('pre');
lastPayloadEl.style.height = '200px';
lastPayloadEl.style.overflow = 'auto';
lastPayloadEl.style.background = '#f6f6f6';
lastPayloadEl.style.padding = '12px';
lastPayloadEl.style.border = '1px solid #ddd';
lastPayloadEl.textContent = 'Last payload: none';

const tokenInput = document.createElement('input');
tokenInput.type = 'text';
tokenInput.placeholder = 'JWT access token';
tokenInput.style.marginRight = '8px';
tokenInput.style.width = '320px';

const tournamentInput = document.createElement('input');
tournamentInput.type = 'number';
tournamentInput.placeholder = 'Tournament ID';
tournamentInput.min = '1';
tournamentInput.style.marginRight = '8px';

const roomInput = document.createElement('input');
roomInput.type = 'number';
roomInput.placeholder = 'Room ID';
roomInput.min = '1';
roomInput.style.marginRight = '8px';

const connectButton = document.createElement('button');
connectButton.textContent = 'Connect';
connectButton.style.marginRight = '8px';

const joinButton = document.createElement('button');
joinButton.textContent = 'Join Tournament';
joinButton.disabled = true;
joinButton.style.marginRight = '8px';

const leaveButton = document.createElement('button');
leaveButton.textContent = 'Leave Tournament';
leaveButton.disabled = true;

const controlsWrapper = document.createElement('div');
controlsWrapper.style.marginBottom = '16px';
controlsWrapper.append(
  connectButton,
  tokenInput,
  roomInput,
  tournamentInput,
  joinButton,
  leaveButton,
);

const backendInfo = document.createElement('p');
backendInfo.textContent = `Backend URL: ${backendUrl}`;
backendInfo.style.fontSize = '0.9rem';
backendInfo.style.color = '#666';
backendInfo.style.marginBottom = '16px';

app.append(statusEl, backendInfo, controlsWrapper, logsEl, lastPayloadEl);

let manager: Manager | undefined;
let socket: GameSocket | undefined;
let subscribedTournament: number | undefined;
let subscribedRoom: number | undefined;

const renderStatus = (message: string) => {
  statusEl.textContent = message;
};

const log = (message: string) => {
  const timestamp = new Date().toISOString();
  logsEl.textContent = `${timestamp} ${message}\n${logsEl.textContent}`;
};

const stringifyPayload = (payload: unknown) =>
  JSON.stringify(payload, null, 2) ?? 'null';

const ensureSocket = () => {
  if (socket) {
    return socket;
  }

  const token = tokenInput.value.trim();
  const managerOptions: Partial<ManagerOptions> = {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
    path: '/socket.io',
  };

  manager = new Manager(backendUrl, managerOptions);
  const instance = manager.socket('/games') as GameSocket;
  instance.connect();

  instance.on('connect', () => {
    renderStatus(`Connected with id ${instance.id}`);
    log('Socket connected');
    joinButton.disabled = false;
    leaveButton.disabled = !subscribedTournament;
  });

  instance.on('disconnect', (reason) => {
    renderStatus(`Disconnected: ${reason}`);
    log(`Socket disconnected: ${reason}`);
    joinButton.disabled = true;
    leaveButton.disabled = true;
    subscribedTournament = undefined;
    subscribedRoom = undefined;
  });

  instance.on('connect_error', (error) => {
    renderStatus(`Connection error: ${error.message}`);
    log(`Connection error: ${error.message}`);
  });

  instance.on('exception', (payload) => {
    log(`Server exception: ${stringifyPayload(payload)}`);
  });

  instance.on('gameCreated', (payload) => {
    log('Received gameCreated');
    lastPayloadEl.textContent = `Last payload (gameCreated)\n${stringifyPayload(
      payload,
    )}`;
  });

  instance.on('gameUpdated', (payload) => {
    log('Received gameUpdated');
    lastPayloadEl.textContent = `Last payload (gameUpdated)\n${stringifyPayload(
      payload,
    )}`;
  });

  instance.on('gameDeleted', (payload) => {
    log('Received gameDeleted');
    lastPayloadEl.textContent = `Last payload (gameDeleted)\n${stringifyPayload(
      payload,
    )}`;
  });

  socket = instance;
  return instance;
};

connectButton.addEventListener('click', () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
    if (manager) {
      manager.close();
      manager = undefined;
    }
    renderStatus('Manual disconnect');
    log('Disconnected by user');
    joinButton.disabled = true;
    leaveButton.disabled = true;
    subscribedTournament = undefined;
    subscribedRoom = undefined;
    return;
  }

  ensureSocket();
  renderStatus('Connecting...');
  log('Connecting to websocket...');
});

joinButton.addEventListener('click', () => {
  const tournamentId = Number(tournamentInput.value);
  const roomId = Number(roomInput.value);
  if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
    log('Please enter a valid tournament id before joining');
    return;
  }

  if (!Number.isInteger(roomId) || roomId <= 0) {
    log('Please enter a valid room id before joining');
    return;
  }

  if (!tokenInput.value.trim()) {
    log('Provide a JWT access token before joining');
    return;
  }

  const instance = ensureSocket();
  const token = tokenInput.value.trim();
  const payload: JoinPayload = {
    tournamentId,
    roomId,
    token: token || undefined,
  };
  leaveButton.disabled = true;
  instance.emit('joinTournament', payload, (response) => {
    if (response?.status === 'joined') {
      log(
        `Joined tournament ${tournamentId} (room ${roomId}) via ${
          response.room ?? 'server room'
        }`,
      );
      subscribedTournament = tournamentId;
      subscribedRoom = roomId;
      leaveButton.disabled = false;
      return;
    }

    const errorMessage = response?.message ?? 'Join request rejected';
    log(`Join failed: ${errorMessage}`);
  });
  log(`Join request sent for tournament ${tournamentId} in room ${roomId}`);
});

leaveButton.addEventListener('click', () => {
  if (!subscribedTournament || !subscribedRoom) {
    log('No active tournament subscription to leave');
    return;
  }

  const instance = ensureSocket();
  const token = tokenInput.value.trim();
  const payload: JoinPayload = {
    tournamentId: subscribedTournament,
    roomId: subscribedRoom,
    token: token || undefined,
  };
  leaveButton.disabled = true;
  instance.emit('leaveTournament', payload, (response) => {
    if (response?.status === 'left') {
      log('Leave confirmed by server');
      subscribedTournament = undefined;
      subscribedRoom = undefined;
      return;
    }

    const errorMessage = response?.message ?? 'Leave request rejected';
    log(`Leave failed: ${errorMessage}`);
    leaveButton.disabled = false;
  });
  log(
    `Leave request sent for tournament ${subscribedTournament} (room ${subscribedRoom})`,
  );
});
