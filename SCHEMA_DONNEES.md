# Schéma de Données — CODENLIGNE

La base de données MongoDB contient les collections suivantes :

## 1. `users`
- `_id` : ObjectId
- `firstName`, `lastName`, `username`, `phone`, `email`
- `password` : Hash bcrypt
- `role` : Enum (`LEARNER`, `ADMIN`, `SUPER_ADMIN`, `PEDAGOGICAL_MANAGER`)
- `status` : Enum (`PENDING`, `ACTIVE`, `BLOCKED`, `REFUSED`, `EXPIRED`)
- `accessEndsAt` : Date (UTC)
- `resetPasswordToken`, `resetPasswordExpires`

## 2. `themes` / `chapters` / `lessons`
- `themes` : `title`, `slug`, `description`
- `chapters` : `themeId`, `title`, `slug`
- `lessons` : `chapterId`, `title`, `slug`, `content` (HTML), `order`

## 3. `progress`
- `userId`, `lessonId`, `completedAt`, `completedBy` (manual/auto)

## 4. `questions`
- `statement`, `type` (`SINGLE`/`MULTIPLE`), `options`, `correctOptionIndex`, `correctOptionIndexes`
- `explanation`, `difficulty`, `themeId`, `status`

## 5. `question_versions`
- `questionId`, `versionNumber`, `snapshot` (objet complet), `createdAt`

## 6. `quizzes`
- `title`, `description`, `mode`, `passThreshold`, `durationSec`, `questionIds`

## 7. `attempts`
- `userId`, `quizId`, `mode`, `status` (`IN_PROGRESS`, `COMPLETED`)
- `drawSnapshot` (questions figées), `answers`, `score20`, `passed`, `finalizedAt`

## 8. `access_logs`
- `userId`, `actorId`, `action`, `reason`, `previousStatus`, `newStatus`

## 9. `audit_logs`
- `actorId`, `action`, `targetType`, `targetId`, `changes`, `createdAt`