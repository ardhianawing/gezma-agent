# Gezma Agent — API Reference

> Auto-generated on 2026-02-25 by `npm run docs:api`

**Total routes:** 138  
**Domains:** 23

---

## Table of Contents

- [academy](#academy) (10 routes)
- [activities](#activities) (1 routes)
- [agency](#agency) (3 routes)
- [auth](#auth) (9 routes)
- [blockchain](#blockchain) (4 routes)
- [chat](#chat) (1 routes)
- [command-center](#command-center) (11 routes)
- [dashboard](#dashboard) (3 routes)
- [gamification](#gamification) (4 routes)
- [health](#health) (2 routes)
- [integrations](#integrations) (15 routes)
- [notifications](#notifications) (2 routes)
- [packages](#packages) (4 routes)
- [pilgrim-portal](#pilgrim-portal) (20 routes)
- [pilgrims](#pilgrims) (15 routes)
- [reports](#reports) (7 routes)
- [search](#search) (1 routes)
- [settings](#settings) (12 routes)
- [share](#share) (1 routes)
- [tasks](#tasks) (2 routes)
- [trips](#trips) (7 routes)
- [users](#users) (2 routes)
- [verify](#verify) (2 routes)

---

## academy

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/academy/:courseId/certificate` |
| `POST` | `/api/academy/:courseId/quiz/attempt` |
| `GET` | `/api/academy/:courseId/quiz` |
| `POST` | `/api/academy/:courseId/quiz` |
| `DELETE` | `/api/academy/:courseId/reviews/:reviewId` |
| `GET` | `/api/academy/:courseId/reviews` |
| `POST` | `/api/academy/:courseId/reviews` |
| `GET` | `/api/academy/courses/:id/lessons/:lessonId` |
| `GET` | `/api/academy/courses/:id` |
| `GET` | `/api/academy/courses` |
| `POST` | `/api/academy/progress/:courseId` |
| `GET` | `/api/academy/progress` |

## activities

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/activities` |

## agency

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/agency/export` |
| `GET` | `/api/agency/public/:slug` |
| `GET` | `/api/agency` |
| `PUT` | `/api/agency` |

## auth

**Auth:** Public (login/register) or Agent auth

| Method | Path |
|--------|------|
| `POST` | `/api/auth/forgot-password` |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/logout` |
| `GET` | `/api/auth/me` |
| `PUT` | `/api/auth/password` |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/reset-password` |
| `POST` | `/api/auth/totp-verify` |
| `GET` | `/api/auth/verify/:code` |

## blockchain

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `POST` | `/api/blockchain/certificates/:id/revoke` |
| `GET` | `/api/blockchain/certificates/:id` |
| `GET` | `/api/blockchain/certificates` |
| `POST` | `/api/blockchain/certificates` |
| `GET` | `/api/blockchain/verify/:number` |

## chat

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `POST` | `/api/chat` |

## command-center

**Auth:** Command Center auth (cc_token)

| Method | Path |
|--------|------|
| `GET` | `/api/command-center/agencies/:id` |
| `PATCH` | `/api/command-center/agencies/:id` |
| `GET` | `/api/command-center/agencies` |
| `GET` | `/api/command-center/alerts` |
| `GET` | `/api/command-center/analytics` |
| `GET` | `/api/command-center/audit-log` |
| `POST` | `/api/command-center/auth/login` |
| `POST` | `/api/command-center/auth/logout` |
| `GET` | `/api/command-center/auth/me` |
| `POST` | `/api/command-center/auto-suspend` |
| `GET` | `/api/command-center/compliance` |
| `GET` | `/api/command-center/stats` |

## dashboard

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/dashboard/alerts` |
| `GET` | `/api/dashboard/charts` |
| `GET` | `/api/dashboard/stats` |

## gamification

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/gamification/badges` |
| `GET` | `/api/gamification/history` |
| `GET` | `/api/gamification/leaderboard` |
| `GET` | `/api/gamification/stats` |

## health

**Auth:** Public (no auth required)

| Method | Path |
|--------|------|
| `GET` | `/api/health/ready` |
| `GET` | `/api/health` |

## integrations

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/integrations/nusuk/hotels` |
| `GET` | `/api/integrations/nusuk` |
| `POST` | `/api/integrations/nusuk` |
| `GET` | `/api/integrations/nusuk/visa/:pilgrimId` |
| `POST` | `/api/integrations/nusuk/visa/:pilgrimId` |
| `GET` | `/api/integrations/payment/invoices/:id` |
| `DELETE` | `/api/integrations/payment/invoices/:id` |
| `GET` | `/api/integrations/payment/invoices` |
| `POST` | `/api/integrations/payment/invoices` |
| `GET` | `/api/integrations/payment` |
| `POST` | `/api/integrations/payment` |
| `POST` | `/api/integrations/payment/webhook` |
| `GET` | `/api/integrations/umrahcash/rate` |
| `POST` | `/api/integrations/umrahcash/rate` |
| `GET` | `/api/integrations/umrahcash` |
| `POST` | `/api/integrations/umrahcash` |
| `GET` | `/api/integrations/umrahcash/transfer` |
| `POST` | `/api/integrations/umrahcash/transfer` |
| `POST` | `/api/integrations/whatsapp/broadcast` |
| `GET` | `/api/integrations/whatsapp` |
| `POST` | `/api/integrations/whatsapp` |
| `POST` | `/api/integrations/whatsapp/send` |
| `GET` | `/api/integrations/whatsapp/templates` |
| `POST` | `/api/integrations/whatsapp/test` |

## notifications

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `PATCH` | `/api/notifications/:id` |
| `DELETE` | `/api/notifications/:id` |
| `GET` | `/api/notifications` |
| `PATCH` | `/api/notifications` |

## packages

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `POST` | `/api/packages/:id/brochure` |
| `POST` | `/api/packages/:id/duplicate` |
| `GET` | `/api/packages/:id` |
| `PUT` | `/api/packages/:id` |
| `DELETE` | `/api/packages/:id` |
| `GET` | `/api/packages` |
| `POST` | `/api/packages` |

## pilgrim-portal

**Auth:** Pilgrim Portal auth (pilgrim_token)

| Method | Path |
|--------|------|
| `POST` | `/api/pilgrim-portal/doa/favorites` |
| `GET` | `/api/pilgrim-portal/doa` |
| `GET` | `/api/pilgrim-portal/documents` |
| `POST` | `/api/pilgrim-portal/documents` |
| `DELETE` | `/api/pilgrim-portal/gallery/:id` |
| `GET` | `/api/pilgrim-portal/gallery` |
| `POST` | `/api/pilgrim-portal/gallery` |
| `GET` | `/api/pilgrim-portal/gamification/badges` |
| `GET` | `/api/pilgrim-portal/gamification/history` |
| `GET` | `/api/pilgrim-portal/gamification/stats` |
| `POST` | `/api/pilgrim-portal/login` |
| `POST` | `/api/pilgrim-portal/logout` |
| `POST` | `/api/pilgrim-portal/manasik/progress` |
| `GET` | `/api/pilgrim-portal/manasik` |
| `GET` | `/api/pilgrim-portal/me` |
| `PATCH` | `/api/pilgrim-portal/profile` |
| `GET` | `/api/pilgrim-portal/referral` |
| `POST` | `/api/pilgrim-portal/referral` |
| `POST` | `/api/pilgrim-portal/referral/use` |
| `POST` | `/api/pilgrim-portal/roommate/match` |
| `GET` | `/api/pilgrim-portal/roommate` |
| `POST` | `/api/pilgrim-portal/roommate` |
| `POST` | `/api/pilgrim-portal/share-itinerary` |
| `GET` | `/api/pilgrim-portal/testimonial` |
| `POST` | `/api/pilgrim-portal/testimonial` |

## pilgrims

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `DELETE` | `/api/pilgrims/:id/documents/:docId` |
| `POST` | `/api/pilgrims/:id/documents` |
| `GET` | `/api/pilgrims/:id/history` |
| `GET` | `/api/pilgrims/:id/invoice` |
| `DELETE` | `/api/pilgrims/:id/notes/:noteId` |
| `GET` | `/api/pilgrims/:id/notes` |
| `POST` | `/api/pilgrims/:id/notes` |
| `DELETE` | `/api/pilgrims/:id/payments/:paymentId` |
| `GET` | `/api/pilgrims/:id/payments` |
| `POST` | `/api/pilgrims/:id/payments` |
| `GET` | `/api/pilgrims/:id/qr` |
| `GET` | `/api/pilgrims/:id` |
| `PUT` | `/api/pilgrims/:id` |
| `DELETE` | `/api/pilgrims/:id` |
| `PATCH` | `/api/pilgrims/:id/status` |
| `POST` | `/api/pilgrims/bulk` |
| `GET` | `/api/pilgrims/export` |
| `POST` | `/api/pilgrims/import` |
| `GET` | `/api/pilgrims` |
| `POST` | `/api/pilgrims` |

## reports

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/reports/conversion` |
| `GET` | `/api/reports/demographics` |
| `GET` | `/api/reports/documents` |
| `GET` | `/api/reports/financial/export` |
| `GET` | `/api/reports/financial` |
| `GET` | `/api/reports/payment-aging` |
| `POST` | `/api/reports/send-scheduled` |

## search

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/search` |

## settings

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/settings/email-templates/:event` |
| `PATCH` | `/api/settings/email-templates/:event` |
| `GET` | `/api/settings/email-templates` |
| `POST` | `/api/settings/email-templates` |
| `GET` | `/api/settings/notifications` |
| `PUT` | `/api/settings/notifications` |
| `POST` | `/api/settings/onboarding-complete` |
| `PATCH` | `/api/settings/scheduled-reports/:id` |
| `DELETE` | `/api/settings/scheduled-reports/:id` |
| `GET` | `/api/settings/scheduled-reports` |
| `POST` | `/api/settings/scheduled-reports` |
| `POST` | `/api/settings/security/change-password` |
| `GET` | `/api/settings/security/login-history` |
| `GET` | `/api/settings/security/sessions` |
| `DELETE` | `/api/settings/security/sessions` |
| `POST` | `/api/settings/security/totp/disable` |
| `POST` | `/api/settings/security/totp/setup` |
| `POST` | `/api/settings/security/totp/verify` |

## share

**Auth:** Public (no auth required)

| Method | Path |
|--------|------|
| `GET` | `/api/share/itinerary/:code` |

## tasks

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `PATCH` | `/api/tasks/:id` |
| `DELETE` | `/api/tasks/:id` |
| `GET` | `/api/tasks` |
| `POST` | `/api/tasks` |

## trips

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `PATCH` | `/api/trips/:id/checklist` |
| `DELETE` | `/api/trips/:id/manifest/:pilgrimId` |
| `POST` | `/api/trips/:id/manifest` |
| `PATCH` | `/api/trips/:id/manifest` |
| `GET` | `/api/trips/:id` |
| `PUT` | `/api/trips/:id` |
| `DELETE` | `/api/trips/:id` |
| `DELETE` | `/api/trips/:id/waiting-list/:entryId` |
| `GET` | `/api/trips/:id/waiting-list` |
| `POST` | `/api/trips/:id/waiting-list` |
| `GET` | `/api/trips` |
| `POST` | `/api/trips` |

## users

**Auth:** Agent auth (JWT cookie)

| Method | Path |
|--------|------|
| `GET` | `/api/users/:id` |
| `PUT` | `/api/users/:id` |
| `DELETE` | `/api/users/:id` |
| `GET` | `/api/users` |
| `POST` | `/api/users` |

## verify

**Auth:** Public (no auth required)

| Method | Path |
|--------|------|
| `GET` | `/api/verify/:code` |
| `GET` | `/api/verify/pilgrim/:code` |
