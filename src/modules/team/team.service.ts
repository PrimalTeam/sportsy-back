import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/interfaces/baseService';
import { CreateTeamDto, GenerateTeamDto } from './dto/createTeam.dto';
import { UpdateTeamDto } from './dto/updateTeam.dto';

@Injectable()
export class TeamService extends BaseService<Team> {
  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
  ) {
    super(teamRepository, Team);
  }

  async generateTeam(generateTeamDto: GenerateTeamDto) {
    return this.teamRepository.create(generateTeamDto);
  }

  async createTeam(createTeamDto: CreateTeamDto, touranmentId: number) {
    const team = this.teamRepository.create(createTeamDto);
    team.tournamentId = touranmentId;
    return this.teamRepository.save(team);
  }

  async updateTeam(
    updateTeamDto: UpdateTeamDto,
    teamId: number,
    touranmentId: number,
  ) {
    await this.checkTeamRelation(teamId, touranmentId);
    await this.teamRepository.update({ id: teamId }, updateTeamDto);
    return this.findById(teamId);
  }

  async removeTeam(teamId: number, touranmentId: number) {
    await this.checkTeamRelation(teamId, touranmentId);
    return this.teamRepository.delete(teamId);
  }

  async findTournamentTeams(tournamentId: number) {
    return this.teamRepository.find({ where: { tournamentId } });
  }

  private async checkTeamRelation(teamId: number, touranmentId: number) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, tournamentId: touranmentId },
    });
    if (!team) {
      throw new HttpException(
        'The team you are trying access dont exists or you dont have access to it.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return team;
  }
}
