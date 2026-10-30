# Admin M6 frontend demo

## Scope and routes

This is a frontend-only prototype. Every Admin page displays: **Demo — changes are not saved to the server.** Demo access is not authentication or authorization. There are no API calls or real API mutations in the Admin demo.

| Route            | Workflow                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`         | User/role totals, publication totals, active enrollments, completion rate, enrollment trend, graded quiz statistics and per-course completion |
| `/admin/users`   | Search name/email/ID, filter role, paginate, inspect details, confirm a demo role change                                                      |
| `/admin/courses` | Search title/code/description/instructor, filter publication, paginate, inspect course/instructor/statistics, confirm a publication change    |
| `/admin/reports` | Search content/reason/ID/review note, filter status, paginate, inspect discussion/comment content and record a confirmed review               |
| `/admin/logs`    | Search actor/target/action/details/ISO or displayed ICT date/ID, filter action, paginate and inspect event details                                             |

Filters run against the entire in-memory dataset before pagination (five rows per page). Filter edits reset the page; data changes clamp an invalid page. Empty results offer Clear Filters. Dialogs use native modal focus containment, Escape dismissal and focus restoration; if filtering removes the opener, focus returns to the page search input. Nested confirmations return to their detail dialog. If a successful mutation disables the confirmation opener, focus returns to the parent detail dialog's Close button. Long text wraps and tables scroll within a keyboard-focusable region on narrow screens.

The scoped `frontend/.gitignore` exception keeps `src/app/admin/logs/` visible to Git despite the repository-wide runtime `logs/` ignore rule.

## Shared state and fixture

`AdminDemoProvider` lives in the Admin layout, above all five routes. Next.js client navigation between Admin pages preserves changes. A full page reload resets in-memory demo state. Leaving and remounting the Admin layout also starts a new demo session. There is no browser persistence.

`createAdminDemo()` creates the single deterministic fixture: 14 users, 8 courses, 24 enrollment records, 12 graded quiz attempts, 9 pending reports and 8 seeded publication events. All identities and enrollment links reference the same users/courses. Optional avatars are omitted and shown as Not provided.

User and Role reuse shared definitions. Course uses a `Pick<Course, ...>` projection plus the existing backend `code` field: no fake rating, thumbnail or curriculum is supplied. Enrollment reuses the roster's ID/status/date/progress fields with normalized student/course links. Counts, instructor names and overview values are derived, not stored copies. Role changes do not rewrite historical course ownership or enrollment references.

New types are scoped to this prototype: content reports and administrative events have no existing shared equivalents; quiz attempt projections support aggregate display without pretending to be a full submission response. These are not backend contracts or schema additions.

## Provisional conventions

These conventions are explicitly provisional, not confirmed business rules:

- **Active Enrollments:** records with status `active`, never all-time enrollments.
- **Completion:** `completed / (active + completed)`. Cancelled/suspended records are excluded. No eligible denominator means **N/A**. This is distinct from lesson progress percentage. Fixture completed records have 100% progress.
- **Trend:** count fixture records by `enrolledAt` month (August–October 2026). It does not reconstruct re-enrollment history.
- **Learning results:** average percentage score and pass rate across every graded quiz attempt, including repeat attempts. Compare each attempt with its own pass score. No attempts means **N/A**. Assignment point scores are excluded. Initial values: average 74.3%, pass rate 66.7%, completion 50%, active enrollments 6.
- **Review:** only discussion threads/comments. Pending means not reviewed; Resolved records a completed review; Dismissed records no further report handling is needed. The review-note textarea has the semantic `required` attribute. A trimmed nonblank note is still required before the confirmation workflow; whitespace alone is not sufficient. Neither outcome hides, removes, edits or sanctions content/users. Existing reviews can be revised; identical status and trimmed note are a no-op.
- **Audit:** successful role, publication and report-review changes create exactly one event containing actor snapshot, target, time and details. Cancelled/no-op actions create no success event. The fixed demonstration actor is Alex Morgan, not an authenticated identity. New timestamps advance one minute per action from 28 October 2026, 09:00 UTC; these are simulated times. The UI displays dates in ICT (UTC+7). Seed history is illustrative, not a complete event-sourced reconstruction.

Reset Demo asks for confirmation and restores the entire original fixture, derived metrics, report states, sequence and audit history. Cancelling reset preserves changes. Reset itself is not retained in the restored audit history.

## Integration gaps (separate from demo completion)

Backend findings below are inferred from source inspection at the selected base, not verified against a running backend. Confirm request handling, permissions and stored-data behavior at runtime with the backend owner before integration.

- Shared login UI is not connected to a session flow. Integrate with the existing cookie-based backend auth; do not create separate Admin authentication.
- Source inspection suggests public course GET handlers bypass JWT hydration while relying on `req.user` for draft visibility. Verify authenticated draft access at runtime before deciding on a fix.
- The registration DTO/service appear to permit the Admin enum value. Role mutation code does not show last-Admin/self-demotion/ownership safeguards. Verify both behaviors at runtime and coordinate requirements for server-side restrictions; the demo does not invent these rules.
- Account blocking/unblocking is unimplemented in this demo: no supported account-status entity field/API was found in the inspected backend source. Verify backend capabilities at runtime before integration. Enrollment status is not account status. Shared User remains unchanged.
- No reports/review or administrative audit storage/APIs were found in the inspected source; confirm backend availability at runtime. `query_audit_logs` contains AI queries/responses, not administrative events.
- No system-wide metrics/trend contract or completion timestamp was found in the inspected source. Source suggests re-enrollment replaces enrollment timestamps, and lesson progress and enrollment completion status may diverge across grading paths. Verify these behaviors using runtime data before integrating historical statistics.
- Verify API base URL, credential/CORS settings, response envelopes and nullable fields. Use small explicit adapters for nested instructor/read responses and snake_case mutation responses. Do not fabricate endpoints or filter only a server-paginated page.
- Instructors retain publishing capabilities. No mandatory Admin publication approval is introduced.

API-connected completion requires real session/permission checks, verified contracts, server search/pagination and successful HTTP/browser integration checks. Passing this demo's checks does not establish API integration.

## Validation

Run from `frontend/`:

```sh
node tests/admin-demo.test.cjs
npx tsc --noEmit
npm run build
```

The targeted test runner uses the existing TypeScript dependency to execute pure reducer/metric/pagination logic. It covers fixture references, denominator behavior, mutation/no-op semantics, report content immutability, reset and pagination clamping. Static type checking is separate.

Environment notes: the starting lockfile contains invalid JSON and a Windows SWC package is directly declared. Installation for this assessment used `npm install --package-lock=false --force` without changing dependency files. The ordinary production build could not fetch the three existing Google Fonts. An environment-only font mock and `NEXT_IGNORE_INCORRECT_LOCKFILE=1` can exercise compilation/rendering without modifying shared source; any such result must be reported as conditional, with substitute fonts, not as an unqualified production build pass.

## Screenshot guidance

Use the Admin navigation to preserve state. Begin with Reset Demo and confirm it. Keep the shared demo notice visible and identify screenshots as Demo in the Interim Report.

1. Overview: initial metric cards and enrollment trend; expand Provisional metric definitions for a definition view.
2. Users: role filter and page indicator; open a user and capture the role-change confirmation, then confirm.
3. Courses: Draft filter and course detail/publication confirmation. Publish a draft in the demo, then revisit Overview to show updated publication totals.
4. Reports: inspect report-1, enter a review note, capture the confirmation, save and filter Resolved.
5. Audit Logs: capture events for the role/publication/review changes; open one for actor, target, timestamp and details.
6. Narrow viewport: capture navigation wrapping and a horizontally scrollable table or report detail dialog.

Also verify cancel/no-op actions create no event, resetting cancels/preserves or restores state correctly, and a full reload restores the original fixture. Substitute-font captures require a note; recapture with production fonts when network access is available.

## Checks performed for this implementation

- `node tests/admin-demo.test.cjs`: all eight domain-check groups passed, including repeat-attempt weighting with per-attempt pass scores and course scoping with populated data.
- `npx tsc --noEmit`: passed.
- Ordinary `npm run build`: failed fetching the three Google Fonts from the existing root layout; it also reported the pre-existing invalid lockfile. This is not an unqualified production-build pass.
- Initial implementation, before the small review follow-up: conditional production build passed compilation, type validation and generation of all 19 routes, including all five Admin routes, using the environment-only font substitution and lockfile-patch skip described above. Application dependency/configuration files were not changed.
- Initial implementation: Chromium against the conditional production build: navigation, all list filters/pagination, details, confirmations, cancellation/no-op behavior, cross-page state, three event types, reset/cancel-reset, reload reset and a 390px viewport passed. Final runs had no page JavaScript errors and no POST/PUT/PATCH/DELETE requests.
- Initial implementation: direct loads of all five routes passed without hydration errors or horizontal page overflow at 390px. Tab/Shift+Tab containment, Escape dismissing only the top confirmation, focus return and a 1,000-character review note were checked.
- `git diff --check`: passed.

Local scratch runners, font substitution and eleven inspection screenshots are retained under the ignored `work/test-results/admin-m6/` directory in the task worktree. Screenshot names: `admin-overview.png`, `admin-role-confirmation.png`, `admin-courses.png`, `admin-report-review.png`, `admin-audit-logs.png`, `admin-audit-details.png`, `admin-mobile-reports.png`, `admin-mobile-review.png`, `admin-users.png`, `admin-course-details.png`, `admin-publication-confirmation.png` (inside `browser-captures/`). They use substitute fonts. Recapture these views with the intended Google Fonts before using them as final report images.

To repeat the conditional build locally, from the worktree root (scratch files are not tracked):

```sh
NEXT_IGNORE_INCORRECT_LOCKFILE=1 \
NEXT_FONT_GOOGLE_MOCKED_RESPONSES="$PWD/work/test-results/admin-m6/admin-font-responses.cjs" \
npm --prefix frontend run build
```

The browser runners require Python Playwright and Chromium in the execution environment; neither is added to application dependencies.

## Small review follow-up validation

The Users page now says "Account blocking is unavailable in this demo." Course details use "Course details and demo publication controls." The Logs description is "Administrative demo events, newest first." Backend explanations remain in the integration section rather than these UI descriptions. Audit search matches both the original ISO timestamp and the exact displayed ICT date/time string.

- Domain tests: all eight groups passed. New cases verify multiple attempts for the same learner/course with different pass scores (attempt-weighted average 50%, pass rate 75%), and populated course metrics excluding other courses' enrollments and attempts. The shipped fixture distribution and metric conventions are unchanged.
- TypeScript (`npx tsc --noEmit`) and `git diff --check`: passed.
- Targeted Chromium check (`python work/test-results/admin-m6-follow-up/browser-check.py`, from the worktree root): passed displayed ICT date/time search and existing ISO search; semantic required state in the accessibility tree; empty/whitespace note guards; nested confirmation, Escape and focus restoration after report, role and publication changes remove a row from the active filter. Exactly three successful changes produced three events, with no page errors or API mutation requests.
- A disabled confirmation opener now returns focus to the parent detail dialog's Close button; closing that dialog after its table row disappears returns focus to the page search field.
- Browser checks used the development server with the existing validation-only Google font mock and lockfile-patching skip. They do not validate real Google Fonts or backend authorization.
- Neither the standard nor the conditional production build was rerun for this follow-up. The standard production build remains unresolved; the earlier conditional-build success applies to the earlier implementation only.

Existing inspection screenshots and review archives predate this follow-up and are historical evidence, not captures/exports of the revised source.
