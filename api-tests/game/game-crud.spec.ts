import {
  apiClient,
  authenticateTestUser,
  buildUniqueUser,
} from '../utils/api-client';
import { GameStatusEnum } from 'src/modules/game/entities/game.entity';
import { safeRequest } from '../utils/request-helpers';

const AUTH_HEADER = 'Authorization';

describe('Game API CRUD (client perspective)', () => {
  const agent = apiClient();
  const adminCredentials = buildUniqueUser();

  let accessToken: string;
  let roomId: number;
  let tournamentId: number;
  const createdTeamIds: number[] = [];
  let createdGameId: number | undefined;

  beforeEach(async () => {
    createdGameId = undefined;
    createdTeamIds.length = 0;

    const authenticatedUser = await authenticateTestUser(
      agent,
      adminCredentials,
    );
    accessToken = authenticatedUser.tokens.accessToken;

    const roomName = `Game Test Room ${Date.now()}`;
    const roomResponse = await safeRequest('Create room for game tests', () =>
      agent
        .post('/room/create')
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({ name: roomName }),
    );

    expect(roomResponse.status).toBe(201);
    roomId = roomResponse.body.id;
    tournamentId = roomResponse.body.tournament.id;

    for (let index = 0; index < 2; index += 1) {
      const teamName = `Game Team ${index + 1} ${Date.now()}`;
      const teamResponse = await safeRequest(
        `Create prerequisite team ${index + 1}`,
        () =>
          agent
            .post(`/team/${roomId}/`)
            .set(AUTH_HEADER, `Bearer ${accessToken}`)
            .send({ name: teamName }),
      );

      expect(teamResponse.status).toBe(201);
      createdTeamIds.push(teamResponse.body.id);
    }
  });

  afterEach(async () => {
    if (createdGameId) {
      await agent
        .delete(`/game/${roomId}/${createdGameId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .catch(() => undefined);
    }

    if (createdTeamIds.length > 0) {
      await Promise.all(
        createdTeamIds.map((teamId) =>
          agent
            .delete(`/team/${roomId}/${teamId}`)
            .set(AUTH_HEADER, `Bearer ${accessToken}`)
            .catch(() => undefined),
        ),
      );
    }

    if (roomId) {
      await agent
        .delete(`/room/${roomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .catch(() => undefined);
    }

    createdGameId = undefined;
    createdTeamIds.length = 0;
  });

  const createGameForTest = async () => {
    expect(createdTeamIds.length).toBeGreaterThanOrEqual(2);

    const response = await safeRequest('Create game', () =>
      agent
        .post(`/game/${roomId}/${tournamentId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({ teamIds: createdTeamIds }),
    );

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      tournamentId,
      teams: expect.arrayContaining([
        expect.objectContaining({ id: createdTeamIds[0] }),
        expect.objectContaining({ id: createdTeamIds[1] }),
      ]),
    });

    createdGameId = response.body.id;
    return response;
  };

  it('creates a game', async () => {
    await createGameForTest();
  });

  it('lists games by tournament', async () => {
    await createGameForTest();
    expect(createdGameId).toBeDefined();

    const listResponse = await safeRequest('List games by tournament', () =>
      agent
        .get(`/game/getByTournament/${roomId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: createdGameId })]),
    );
  });

  it('lists games for a specific team', async () => {
    await createGameForTest();
    expect(createdGameId).toBeDefined();

    const teamGamesResponse = await safeRequest('List games by team', () =>
      agent
        .get(`/game/team/${roomId}/${createdTeamIds[0]}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(teamGamesResponse.status).toBe(200);
    expect(teamGamesResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: createdGameId })]),
    );
  });

  it('retrieves the game by id', async () => {
    await createGameForTest();
    expect(createdGameId).toBeDefined();

    const readResponse = await safeRequest('Read game', () =>
      agent
        .get(`/game/${roomId}/${createdGameId}`)
        .query({ include: ['teams'] })
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(readResponse.status).toBe(200);
    expect(readResponse.body).toMatchObject({
      id: createdGameId,
      tournamentId,
      teams: expect.any(Array),
    });
  });

  it('updates the game status and duration', async () => {
    await createGameForTest();
    expect(createdGameId).toBeDefined();

    const duration = '02:15:00';

    const updateResponse = await safeRequest('Update game', () =>
      agent
        .patch(`/game/${roomId}/${createdGameId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`)
        .send({
          status: GameStatusEnum.COMPLETED,
          durationTime: duration,
        }),
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createdGameId,
      status: GameStatusEnum.COMPLETED,
      durationTime: expect.objectContaining({
        hours: 2,
        minutes: 15,
      }),
    });
  });

  it('deletes the game and confirms the removal', async () => {
    await createGameForTest();
    expect(createdGameId).toBeDefined();

    const deletedGameId = createdGameId!;

    const deleteResponse = await safeRequest('Delete game', () =>
      agent
        .delete(`/game/${roomId}/${deletedGameId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toMatchObject({ affected: 1 });

    const postDeleteRead = await safeRequest('Read deleted game', () =>
      agent
        .get(`/game/${roomId}/${deletedGameId}`)
        .set(AUTH_HEADER, `Bearer ${accessToken}`),
    );

    expect(postDeleteRead.status).toBe(404);
    expect(postDeleteRead.body).toMatchObject({
      statusCode: 404,
      message: expect.stringMatching(/Game not found/i),
    });

    createdGameId = undefined;
  });
});
