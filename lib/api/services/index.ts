/**
 * Barrel des services API — CODENLIGNE
 *
 * Seuls les services réellement implémentés sont exportés.
 * Les stubs (courses, quizzes, admin) sont temporairement commentés
 * pour débloquer le build. On les réactive au fur et à mesure.
 */

export * from './auth.service';
export * from './users.service';
export * from './notifications.service';

// TODO : réactiver à l'étape correspondante
// export * from './courses.service';
// export * from './quizzes.service';
// export * from './admin.service';

export { default as authService } from './auth.service';
export { default as usersService } from './users.service';
export { default as notificationsService } from './notifications.service';

// TODO : réactiver à l'étape correspondante
// export { default as coursesService } from './courses.service';
// export { default as quizzesService } from './quizzes.service';
// export { default as adminService } from './admin.service';