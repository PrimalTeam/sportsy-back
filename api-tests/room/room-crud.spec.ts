import {
  apiClient,
  authenticateTestUser,
  buildUniqueUser,
} from '../utils/api-client';
import { safeRequest } from '../utils/request-helpers';

const AUTH_HEADER = 'Authorization';

describe('Room API CRUD (client perspective)', () => {
  const agent = apiClient();
  const credentials = buildUniqueUser();

  let accessToken: string;
  let createdRoomId: number | undefined;
  let roomName: string;
  let updatedName: string;

  beforeAll(async () => {
    const authenticatedUser = await authenticateTestUser(agent, credentials);
    accessToken = authenticatedUser.tokens.accessToken;
  });

  afterAll(async () => {
    if (!createdRoomId) {
      return;
    }

    await agent
      .delete(`/room/${createdRoomId}`)
      .set(AUTH_HEADER, `Bearer ${accessToken}`)
      .catch(() => undefined);
  });

  it('creates a room', async () => {
    roomName = `Integration Room ${Date.now()}`;

    const createResponse = await safeRequest('Create room', () =>
      agent
        .post('/room/create')
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({ name: roomName }),
    );

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      id: expect.any(Number),
      name: roomName,
      tournament: expect.objectContaining({
        id: expect.any(Number),
        roomId: createResponse.body.id,
      }),
    });
    expect(Array.isArray(createResponse.body.roomUsers)).toBe(true);
    expect(
      createResponse.body.roomUsers.some(
        (membership: { role?: string }) => membership.role === 'admin',
      ),
    ).toBe(true);

    createdRoomId = createResponse.body.id;
  });

  it('lists user rooms and finds the created room', async () => {
    expect(createdRoomId).toBeDefined();

    const userRoomsResponse = await safeRequest('List user rooms', () =>
      agent.get('/room/userRooms').set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(userRoomsResponse.status).toBe(200);
    expect(userRoomsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdRoomId,
          name: roomName,
        }),
      ]),
    );
  });

  it('retrieves the room by id', async () => {
    expect(createdRoomId).toBeDefined();

    const readResponse = await safeRequest('Read room', () =>
      agent
        .get(`/room/${createdRoomId}`)
        .query({ include: 'tournament' })
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(readResponse.status).toBe(200);
    expect(readResponse.body).toMatchObject({
      id: createdRoomId,
      name: roomName,
      tournament: expect.objectContaining({ id: expect.any(Number) }),
    });
  });

  it('updates the room name', async () => {
    expect(createdRoomId).toBeDefined();

    updatedName = `${roomName}-updated`;

    const updateResponse = await safeRequest('Update room', () =>
      agent
        .patch(`/room/${createdRoomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({ name: updatedName }),
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createdRoomId,
      name: updatedName,
    });
  });

  it('deletes the room and verifies access is revoked', async () => {
    expect(createdRoomId).toBeDefined();

    const deleteResponse = await safeRequest('Delete room', () =>
      agent
        .delete(`/room/${createdRoomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toMatchObject({ affected: 1 });

    const userRoomsAfterDelete = await safeRequest(
      'List user rooms after delete',
      () =>
        agent.get('/room/userRooms').set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(userRoomsAfterDelete.status).toBe(200);
    expect(
      (userRoomsAfterDelete.body as Array<{ id: number }>).some(
        (room) => room.id === createdRoomId,
      ),
    ).toBe(false);

    createdRoomId = undefined;
  });
});
