# Recent Changes

This document summarizes the new features and fixes recently added to the **Delta** tuition management system. It is intended to help team members understand what changed and where.

---

## 1. Profile Picture Upload (Teachers & Students)

Both roles can now upload a profile photo from their own profile page. Photos are stored as files on the backend (not in the database) and referenced by URL.

### How it works
- Photo is uploaded as a **multipart form field named `photo`**.
- Limits: image only (**JPG, PNG, WEBP, GIF**), maximum **2 MB**.
- Files are saved to `backend/uploads/` (this folder is **gitignored**).
- Files are served statically at **`/api/uploads/<filename>`** (works through the existing Vite `/api` dev proxy).
- The `profilePhoto` field already existed in both the `Teacher` and `Student` models, so **no database schema change / migration is required**.

### Backend changes
| File | Change |
| --- | --- |
| `backend/src/middlewares/upload.middleware.js` | **NEW** — shared multer config (storage, 2 MB limit, image-only filter, unique filenames). Exports `upload` and `uploadDir`. |
| `backend/src/app.js` | Added `app.use('/api/uploads', express.static(uploadDir))` to serve uploaded files. |
| `backend/src/services/teacher.service.js` | Added `uploadProfilePhoto(teacherId, file)` method. |
| `backend/src/controllers/teacher.controller.js` | Added `uploadProfilePhoto` handler. |
| `backend/src/routes/teacher.route.js` | Added `POST /api/teacher/profile/photo` (auth: teacher). |
| `backend/src/services/student.service.js` | Added `uploadProfilePhoto(studentId, file)` method. |
| `backend/src/controllers/student.controller.js` | Added `uploadProfilePhoto` handler. |
| `backend/src/routes/student.route.js` | Added `POST /api/user/profile/photo` (auth: student). |
| `backend/package.json` / `package-lock.json` | Added **multer** dependency. |
| `backend/.gitignore` | Added `uploads/`. |

> Note: multer errors are handled inline in the route (413 for files over 2 MB, 400 otherwise) so the response is a clean JSON error message.

### New API endpoints
| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/teacher/profile/photo` | Teacher | Upload teacher profile photo |
| `POST` | `/api/user/profile/photo` | Student | Upload student profile photo |
| `GET` | `/api/uploads/<filename>` | Public (URL) | Serves the stored image |

### Frontend changes
| File | Change |
| --- | --- |
| `frontend/src/components/Teacher/TeacherProfile.jsx` | Photo preview + **Change Photo** / **Remove Photo** buttons (client-side image type & 2 MB check, uploading spinner). |
| `frontend/src/services/teacherService.js` | Added `uploadProfilePhoto(formData)`. |
| `frontend/src/components/Student/StudentProfile.jsx` | Same photo UI added to the student profile page. |
| `frontend/src/services/studentService.js` | Added `uploadProfilePhoto(formData)`. |

### Important note for the team (axios + FormData)
The shared axios instance sets a default `Content-Type: application/json`. If we post `FormData` with that header, axios converts the FormData to JSON and the backend receives **no file**. The photo upload requests therefore override the header per-request:

```js
api.post('/user/profile/photo', formData, { headers: { 'Content-Type': undefined } })
```

Setting it to `undefined` removes the header so the browser sends the correct `multipart/form-data` boundary. **Keep this pattern for any future file upload.**

---

## 2. Students See Teacher Photos When Booking

The student now sees the teacher's profile photo in the booking flow.

| File | Change |
| --- | --- |
| `backend/src/services/student.service.js` | Added `profilePhoto` to the teacher populate in the dashboard `bookingHistory` queries (today's classes, upcoming classes, booking history). |
| `frontend/src/components/Student/FindTeachers.jsx` | Teacher cards and the **Book Session** modal header show the teacher photo (icon fallback if none). |
| `frontend/src/components/Student/StudentDashboard.jsx` | "Today's Classes" shows the teacher photo next to the name. |
| `frontend/src/components/Student/MyBookings.jsx` | "Subject & Teacher" column shows the teacher photo. |

---

## 3. Teachers See Student Photos in "My Students"

When a student books a slot with a teacher, the teacher sees that student's photo in the **My Students** table.

| File | Change |
| --- | --- |
| `backend/src/services/teacher.service.js` | `getAssignedStudents` now includes `profilePhoto` in the returned student data. |
| `frontend/src/components/Teacher/MyStudents.jsx` | Student Name column shows the student's photo (icon fallback if none). |

> Note: This replaces an earlier decision to keep student photos hidden from teachers — visibility was enabled intentionally.

---

## 4. Grade Fallback in "My Students"

If a student has not entered their grade/class, the My Students table now shows **"N/A"** instead of `-`.

| File | Change |
| --- | --- |
| `frontend/src/components/Teacher/MyStudents.jsx` | `{st.grade || 'N/A'}` in the Grade / Class column. |

---

## 5. "Report Grade" Notification (New)

When a student books a teacher but has **no class/grade** set, the teacher can send them a message asking them to add their correct class or grade. The student receives it as a **notification on their dashboard**.

### Flow
- In the teacher's **My Students** table:
  - Students with no grade show a warning **"No Grade"** badge (instead of plain `N/A`).
  - Those students get a **"Report Grade"** button in a new Action column (button only shows for no-grade students).
- Clicking it opens a modal pre-filled with: *"Please add your correct class or grade in your profile so we can match you with the right teacher."* The teacher can edit the message before sending.
- The student sees the message in a **Notifications** card on their dashboard (unread items highlighted, "Mark all read" button).

### Backend changes
| File | Change |
| --- | --- |
| `backend/src/models/notification.model.js` | **NEW** — `Notification` model (`studentId`, `teacherId`, `message`, `read`). |
| `backend/src/services/teacher.service.js` | Added `notifyStudent(teacherId, studentId, message)` — validates the student exists and has an **approved booking** with this teacher (else 403). |
| `backend/src/controllers/teacher.controller.js` | Added `notifyStudent` handler. |
| `backend/src/routes/teacher.route.js` | Added `POST /api/teacher/students/:id/notify` (auth: teacher). |
| `backend/src/services/student.service.js` | Added `getNotifications(studentId)` and `markNotificationsRead(studentId)`. |
| `backend/src/controllers/student.controller.js` | Added handlers for both. |
| `backend/src/routes/student.route.js` | Added `GET /api/user/notifications` and `PUT /api/user/notifications/read` (auth: student). |

### Frontend changes
| File | Change |
| --- | --- |
| `frontend/src/components/Teacher/MyStudents.jsx` | "No Grade" warning badge + "Report Grade" button (no-grade students only) + report modal. |
| `frontend/src/services/teacherService.js` | Added `notifyStudent(studentId, message)`. |
| `frontend/src/components/Student/StudentDashboard.jsx` | Added a **Notifications** card with unread highlight and "Mark all read". |
| `frontend/src/services/studentService.js` | Added `getNotifications()` and `markNotificationsRead()`. |

> Note: teachers have no grade field, so the "wrong grade" check is **manual** — the teacher decides to report a student who has no grade (or a clearly incorrect one).

---

## 5. Dependency / Security Fix

- `npm audit fix` was run on the backend, which resolved a **high-severity `brace-expansion`** vulnerability.

---

## Testing Checklist

- [ ] Teacher: Profile → Change Photo → upload succeeds, image shows on refresh, Remove Photo works.
- [ ] Student: Profile → Change Photo → upload succeeds.
- [ ] Student: Find Teachers page shows each teacher's photo in the cards and booking modal.
- [ ] Student: Dashboard & My Bookings show teacher photos.
- [ ] Teacher: My Students shows each student's photo; grade shows "N/A" when not set.
- [ ] Oversized (>2 MB) or non-image files are rejected with a clean error message.
- [ ] Teacher: My Students shows a "No Grade" badge + "Report Grade" button only for students without a grade; sending shows a success message.
- [ ] Student: dashboard Notifications card shows the teacher's message; "Mark all read" clears the unread highlight.
