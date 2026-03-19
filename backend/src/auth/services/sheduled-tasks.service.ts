import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokenService } from './token.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly tokenService: TokenService) {}

  @Cron('0 0 * * *', { name: 'cleanupExpiredTokens', timeZone: 'UTC' })
  async handleTokenCleanup(): Promise<void> {
    this.logger.log('Running scheduled token cleanup...');
    try {
      const { deletedCount } = await this.tokenService.cleanupExpiredTokens();
      this.logger.log(`Token cleanup complete: ${deletedCount} removed`);
    } catch (error) {
      this.logger.error('Token cleanup failed', error);
    }
  }

  @Cron('0 1 * * 0', { name: 'logTokenStats', timeZone: 'UTC' })
  async handleTokenStatsLogging(): Promise<void> {
    try {
      const stats = await this.tokenService.getTokenStats();
      this.logger.log(
        `Token stats — total:${stats.total} active:${stats.active} expired:${stats.expired} revoked:${stats.revoked}`,
      );
    } catch (error) {
      this.logger.error('Token stats logging failed', error);
    }
  }

  async manualTokenCleanup(): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
  }> {
    try {
      const { deletedCount } = await this.tokenService.cleanupExpiredTokens();
      return { success: true, deletedCount };
    } catch (error) {
      this.logger.error('Manual token cleanup failed', error);
      return { success: false, deletedCount: 0, error: error.message };
    }
  }
}
