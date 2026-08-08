import 'reflect-metadata';
import '@config/env';
import { setupContainer } from '@config/container';
import { CategoriesRoute } from '@routes/categories.route';
import { CoursesRoute } from '@routes/courses.route';
import { LessonsRoute } from '@routes/lessons.route';
import { ModulesRoute } from '@routes/modules.route';
import { TracksRoute } from '@routes/tracks.route';
import { UsersRoute } from '@routes/users.route';
import { logger } from '@utils/logger';
import { container } from 'tsyringe';
import App from '@/app';

// 🔧 하이브리드 DI 컨테이너 설정
// Infrastructure(Repository) - 명시적 관리
// Business(Service) - 명시적 관리
// Presentation(Controller/Route) - 자동 주입
setupContainer();

// 라우트 인스턴스 생성
const routes = [
  container.resolve(UsersRoute),
  container.resolve(TracksRoute),
  container.resolve(CategoriesRoute),
  container.resolve(CoursesRoute),
  container.resolve(ModulesRoute),
  container.resolve(LessonsRoute),
];

// 앱 인스턴스 생성
const appInstance = new App(routes);

// 서버 시작
const server = appInstance.listen();

// Graceful Shutdown
if (server && typeof server.close === 'function') {
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      logger.info(`Received ${signal}, closing server...`);
      server.close(() => {
        logger.info('HTTP server closed gracefully');
        process.exit(0);
      });
    });
  });
}

export default server;
