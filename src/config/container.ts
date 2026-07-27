import 'reflect-metadata';

// Controller
import { UsersController } from '@controllers/users.controller';

// Repository
import { UsersRepository } from '@repositories/users.repository';
// Route
import { UsersRoute } from '@routes/users.route';
// Service
import { UsersService } from '@services/users.service';
import { container } from 'tsyringe';

let isContainerInitialized = false;

export function setupContainer() {
  if (isContainerInitialized) return;

  // 📊 Infrastructure Layer - 명시적 관리 (안정성 우선)
  const usersRepository = new UsersRepository();
  container.registerInstance(UsersRepository, usersRepository);

  // 📈 Business Layer - 명시적 관리 (의존성 복잡도 고려)
  const usersService = new UsersService(usersRepository);
  container.registerInstance(UsersService, usersService);

  // 🎨 Presentation Layer - 자동 주입 (편의성 우선)
  container.registerSingleton(UsersController);
  container.registerSingleton(UsersRoute);

  isContainerInitialized = true;
}
