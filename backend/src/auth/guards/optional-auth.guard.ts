import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Never throw — allow request through even without valid token
  handleRequest(_err: any, user: any): any {
    return user ?? null;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
