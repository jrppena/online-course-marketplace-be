import 'reflect-metadata';

// Controller
import { CategoriesController } from '@controllers/categories.controller';
import { TracksController } from '@controllers/tracks.controller';
import { UsersController } from '@controllers/users.controller';

// Repository
import { CategoriesRepository } from '@repositories/categories.repository';
import { TracksRepository } from '@repositories/tracks.repository';
import { UsersRepository } from '@repositories/users.repository';
// Route
import { CategoriesRoute } from '@routes/categories.route';
import { TracksRoute } from '@routes/tracks.route';
import { UsersRoute } from '@routes/users.route';
// Service
import { CategoriesService } from '@services/categories.service';
import { TracksService } from '@services/tracks.service';
import { UsersService } from '@services/users.service';
import { container } from 'tsyringe';

let isContainerInitialized = false;

export function setupContainer() {
  if (isContainerInitialized) return;

  // 📊 Infrastructure Layer - 명시적 관리 (안정성 우선)
  const usersRepository = new UsersRepository();
  container.registerInstance(UsersRepository, usersRepository);
  const tracksRepository = new TracksRepository();
  container.registerInstance(TracksRepository, tracksRepository);
  const categoriesRepository = new CategoriesRepository();
  container.registerInstance(CategoriesRepository, categoriesRepository);

  // 📈 Business Layer - 명시적 관리 (의존성 복잡도 고려)
  const usersService = new UsersService(usersRepository);
  container.registerInstance(UsersService, usersService);
  const tracksService = new TracksService(tracksRepository);
  container.registerInstance(TracksService, tracksService);
  const categoriesService = new CategoriesService(categoriesRepository, tracksRepository);
  container.registerInstance(CategoriesService, categoriesService);

  // 🎨 Presentation Layer - 자동 주입 (편의성 우선)
  container.registerSingleton(UsersController);
  container.registerSingleton(UsersRoute);
  container.registerSingleton(TracksController);
  container.registerSingleton(TracksRoute);
  container.registerSingleton(CategoriesController);
  container.registerSingleton(CategoriesRoute);

  isContainerInitialized = true;
}
