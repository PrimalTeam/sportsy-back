import {
  apiClient,
  authenticateTestUser,
  buildUniqueUser,
} from '../utils/api-client';
import { safeRequest } from '../utils/request-helpers';

const AUTH_HEADER = 'Authorization';

describe('Team API CRUD (client perspective)', () => {
  const agent = apiClient();
  const adminCredentials = buildUniqueUser();

  let accessToken: string;
  let roomId: number;
  let createdTeamId: number | undefined;
  let teamName: string;
  let updatedName: string;
  let teamTournamentId: number;

  beforeAll(async () => {
    const authenticatedUser = await authenticateTestUser(
      agent,
      adminCredentials,
    );
    accessToken = authenticatedUser.tokens.accessToken;

    const roomName = `Team Test Room ${Date.now()}`;
    const roomResponse = await safeRequest('Create room for team tests', () =>
      agent
        .post('/room/create')
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({ name: roomName }),
    );

    expect(roomResponse.status).toBe(201);
    roomId = roomResponse.body.id;
  });

  beforeEach(() => {
    createdTeamId = undefined;
    teamName = '';
    updatedName = '';
    teamTournamentId = 0;
  });

  afterEach(async () => {
    if (createdTeamId) {
      await agent
        .delete(`/team/${roomId}/${createdTeamId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .catch(() => undefined);
      createdTeamId = undefined;
    }
  });

  afterAll(async () => {
    await agent
      .delete(`/room/${roomId}`)
      .set(AUTH_HEADER, `Bearer ${accessToken}`)
      .catch(() => undefined);
  });

  const createTeamForTest = async (nameOverride?: string) => {
    teamName = nameOverride ?? `Integration Team ${Date.now()}`;

    const response = await safeRequest('Create team', () =>
      agent
        .post(`/team/${roomId}/`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({ name: teamName }),
    );

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: teamName,
      tournamentId: expect.any(Number),
    });

    createdTeamId = response.body.id;
    teamTournamentId = response.body.tournamentId;
    teamName = response.body.name;
    return response;
  };

  it('creates a team', async () => {
    await createTeamForTest();
  });

  it('lists teams within the tournament', async () => {
    await createTeamForTest();
    expect(createdTeamId).toBeDefined();

    const listResponse = await safeRequest('List teams', () =>
      agent
        .get(`/team/getByTournament/${roomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdTeamId,
          name: teamName,
        }),
      ]),
    );
  });

  it('retrieves the team by id', async () => {
    await createTeamForTest();
    expect(createdTeamId).toBeDefined();

    const readResponse = await safeRequest('Read team', () =>
      agent
        .get(`/team/${roomId}/${createdTeamId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(readResponse.status).toBe(200);
    expect(readResponse.body).toMatchObject({
      id: createdTeamId,
      name: teamName,
      tournamentId: teamTournamentId,
    });
  });

  it('updates the team name', async () => {
    await createTeamForTest();
    expect(createdTeamId).toBeDefined();

    updatedName = `${teamName} Updated`;

    const updateResponse = await safeRequest('Update team', () =>
      agent
        .patch(`/team/${roomId}/${createdTeamId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({ name: updatedName }),
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createdTeamId,
      name: updatedName,
    });
  });

  it('deletes the team and verifies the list no longer contains it', async () => {
    await createTeamForTest();
    expect(createdTeamId).toBeDefined();

    const deleteResponse = await safeRequest('Delete team', () =>
      agent
        .delete(`/team/${roomId}/${createdTeamId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toMatchObject({ affected: 1 });

    const postDeleteList = await safeRequest('List teams after delete', () =>
      agent
        .get(`/team/getByTournament/${roomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(postDeleteList.status).toBe(200);
    expect(
      (postDeleteList.body as Array<{ id: number }>).some(
        (team) => team.id === createdTeamId,
      ),
    ).toBe(false);

    createdTeamId = undefined;
  });
});
