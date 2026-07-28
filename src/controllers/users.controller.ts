import { toUserResponse } from '@dtos/users.dto';
import type { RequestWithUser } from '@interfaces/auth.interface';
import { UsersService } from '@services/users.service';
import { asyncHandler } from '@utils/asyncHandler';
import type { Request, RequestHandler, Response } from 'express';
import { container, injectable } from 'tsyringe';

@injectable()
export class UsersController {
  private readonly usersService: UsersService;

  constructor() {
    this.usersService = container.resolve(UsersService);
  }

  getMe: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { user: claims } = req as RequestWithUser;
    const profile = await this.usersService.getOrCreateProfile(claims);

    res.json({ data: toUserResponse(profile) });
  });

  list: RequestHandler = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.usersService.list();

    res.json({ data: users.map(toUserResponse) });
  });
}
