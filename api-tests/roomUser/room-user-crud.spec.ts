import {
  apiClient,
  authenticateTestUser,
  buildUniqueUser,
  registerUser,
} from '../utils/api-client';
import { safeRequest } from '../utils/request-helpers';

const AUTH_HEADER = 'Authorization';

describe('Room User API CRUD (client perspective)', () => {
  const agent = apiClient();
  const adminCredentials = buildUniqueUser();
  const invitedCredentials = buildUniqueUser();

  let accessToken: string;
  let roomId: number;
  let addedRoomUserId: number | undefined;
  let addedUserId: number | undefined;
  let invitedEmail: string;

  beforeAll(async () => {
    const authenticatedAdmin = await authenticateTestUser(
      agent,
      adminCredentials,
    );
    accessToken = authenticatedAdmin.tokens.accessToken;

    const roomName = `RoomUser Test Room ${Date.now()}`;
    const roomResponse = await safeRequest(
      'Create room for room user tests',
      () =>
        agent
          .post('/room/create')
          .set(AUTH_HEADER, `Bearer ${accessToken}`)
          .send({ name: roomName }),
    );

    expect(roomResponse.status).toBe(201);
    roomId = roomResponse.body.id;

    await registerUser(agent, invitedCredentials);
    invitedEmail = invitedCredentials.email;
  });

  afterAll(async () => {
    if (addedRoomUserId) {
      await agent
        .delete(`/roomUser/${roomId}/${addedRoomUserId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .catch(() => undefined);
    }

    if (roomId) {
      await agent
        .delete(`/room/${roomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .catch(() => undefined);
    }
  });

  it('adds a user to the room', async () => {
    const addResponse = await safeRequest('Add room member', () =>
      agent
        .post(`/roomUser/addUser/${roomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({
          identifier: invitedEmail,
          identifierType: 'email',
          role: 'spectrator',
        }),
    );

    expect(addResponse.status).toBe(201);
    expect(addResponse.body).toMatchObject({
      id: expect.any(Number),
      roomId,
      userId: expect.any(Number),
      role: 'spectrator',
    });

    addedRoomUserId = addResponse.body.id;
    addedUserId = addResponse.body.userId;
  });

  it('fetches the room member entry', async () => {
    expect(addedRoomUserId).toBeDefined();
    expect(addedUserId).toBeDefined();

    const getMemberResponse = await safeRequest('Read room member', () =>
      agent
        .get(`/roomUser/${roomId}/${addedUserId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(getMemberResponse.status).toBe(200);
    expect(getMemberResponse.body).toMatchObject({
      id: addedRoomUserId,
      roomId,
      userId: addedUserId,
      role: 'spectrator',
    });
  });

  it('updates the member role', async () => {
    expect(addedRoomUserId).toBeDefined();
    expect(addedUserId).toBeDefined();

    const changeRoleResponse = await safeRequest('Update member role', () =>
      agent
        .patch(`/roomUser/${roomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({
          identifier: invitedEmail,
          identifierType: 'email',
          role: 'gameObserver',
        }),
    );

    expect(changeRoleResponse.status).toBe(200);
    expect(changeRoleResponse.body).toMatchObject({
      roomId,
      userId: addedUserId,
      role: 'gameObserver',
    });
  });

  it('removes the user from the room', async () => {
    expect(addedRoomUserId).toBeDefined();
    expect(addedUserId).toBeDefined();

    const deleteResponse = await safeRequest('Delete room member', () =>
      agent
        .delete(`/roomUser/${roomId}/${addedRoomUserId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toMatchObject({ affected: 1 });

    const postDeleteResponse = await safeRequest('Read deleted member', () =>
      agent
        .get(`/roomUser/${roomId}/${addedUserId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(postDeleteResponse.status).toBe(200);
    expect(postDeleteResponse.body).toMatchObject({});

    addedRoomUserId = undefined;
    addedUserId = undefined;
  });
});
