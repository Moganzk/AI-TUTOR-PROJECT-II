create table public.ai_interactions (
  id uuid not null default gen_random_uuid (),
  session_id uuid not null,
  user_id uuid not null,
  prompt_tokens integer null default 0,
  completion_tokens integer null default 0,
  total_tokens integer null default 0,
  model_used text null,
  response_time_ms integer null,
  feedback_rating integer null,
  feedback_comment text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint ai_interactions_pkey primary key (id),
  constraint ai_interactions_session_id_fkey foreign KEY (session_id) references chat_sessions (id) on delete CASCADE,
  constraint ai_interactions_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint ai_interactions_feedback_rating_check check (
    (
      (feedback_rating >= 1)
      and (feedback_rating <= 5)
    )
  )
) TABLESPACE pg_default;

create table public.assignment_answers (
  id uuid not null default gen_random_uuid (),
  submission_id uuid not null,
  question_id uuid not null,
  answer_text text null,
  selected_option text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint assignment_answers_pkey primary key (id),
  constraint assignment_answers_submission_id_question_id_key unique (submission_id, question_id),
  constraint assignment_answers_question_id_fkey foreign KEY (question_id) references assignment_questions (id) on delete CASCADE,
  constraint assignment_answers_submission_id_fkey foreign KEY (submission_id) references assignment_submissions (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.assignment_comments (
  id uuid not null default gen_random_uuid (),
  submission_id uuid not null,
  commenter_id uuid not null,
  comment text not null,
  comment_type text null default 'general'::text,
  line_number integer null,
  is_private boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint assignment_comments_pkey primary key (id),
  constraint assignment_comments_commenter_id_fkey foreign KEY (commenter_id) references users (id) on delete CASCADE,
  constraint assignment_comments_submission_id_fkey foreign KEY (submission_id) references assignment_submissions (id) on delete CASCADE,
  constraint assignment_comments_comment_type_check check (
    (
      comment_type = any (
        array[
          'general'::text,
          'inline'::text,
          'rubric'::text,
          'suggestion'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_comments_submission_id on public.assignment_comments using btree (submission_id) TABLESPACE pg_default;

create table public.assignment_extensions (
  id uuid not null default gen_random_uuid (),
  assignment_id uuid not null,
  student_id uuid not null,
  granted_by uuid not null,
  original_due_date timestamp with time zone not null,
  extended_due_date timestamp with time zone not null,
  reason text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint assignment_extensions_pkey primary key (id),
  constraint assignment_extensions_assignment_id_student_id_key unique (assignment_id, student_id),
  constraint assignment_extensions_assignment_id_fkey foreign KEY (assignment_id) references assignments (id) on delete CASCADE,
  constraint assignment_extensions_granted_by_fkey foreign KEY (granted_by) references users (id) on delete CASCADE,
  constraint assignment_extensions_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.assignment_grades (
  id uuid not null default gen_random_uuid (),
  submission_id uuid not null,
  graded_by uuid not null,
  points_earned numeric(5, 2) null,
  percentage numeric(5, 2) null,
  letter_grade text null,
  feedback text null,
  rubric_scores jsonb null default '[]'::jsonb,
  graded_at timestamp with time zone not null default timezone ('utc'::text, now()),
  returned_at timestamp with time zone null,
  is_final boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint assignment_grades_pkey primary key (id),
  constraint assignment_grades_submission_id_key unique (submission_id),
  constraint assignment_grades_submission_id_fkey foreign KEY (submission_id) references assignment_submissions (id) on delete CASCADE,
  constraint assignment_grades_graded_by_fkey foreign KEY (graded_by) references users (id) on delete CASCADE,
  constraint assignment_grades_points_earned_check check ((points_earned >= (0)::numeric)),
  constraint assignment_grades_percentage_check check (
    (
      (percentage >= (0)::numeric)
      and (percentage <= (100)::numeric)
    )
  ),
  constraint check_points_valid check ((points_earned >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_grades_submission_id on public.assignment_grades using btree (submission_id) TABLESPACE pg_default;

create index IF not exists idx_grades_graded_by on public.assignment_grades using btree (graded_by) TABLESPACE pg_default;

create index IF not exists idx_grades_submission on public.assignment_grades using btree (submission_id) TABLESPACE pg_default;

create trigger check_assignment_points BEFORE INSERT
or
update on assignment_grades for EACH row
execute FUNCTION validate_assignment_points ();

create table public.assignment_questions (
  id uuid not null default gen_random_uuid (),
  assignment_id uuid not null,
  question_text text not null,
  question_type text not null,
  options text[] null,
  correct_answer text null,
  points integer null default 1,
  order_index integer not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint assignment_questions_pkey primary key (id),
  constraint assignment_questions_assignment_id_fkey foreign KEY (assignment_id) references assignments (id) on delete CASCADE,
  constraint assignment_questions_points_check check ((points > 0)),
  constraint assignment_questions_question_type_check check (
    (
      question_type = any (
        array[
          'text'::text,
          'essay'::text,
          'multiple_choice'::text,
          'true_false'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_assignment_questions_assignment_order on public.assignment_questions using btree (assignment_id, order_index) TABLESPACE pg_default;

create table public.assignment_submissions (
  id uuid not null default gen_random_uuid (),
  assignment_id uuid not null,
  student_id uuid not null,
  attempt_number integer null default 1,
  content text null,
  file_urls text[] null,
  status text not null default 'draft'::text,
  submitted_at timestamp with time zone null,
  is_late boolean null default false,
  late_minutes integer null default 0,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint assignment_submissions_pkey primary key (id),
  constraint assignment_submissions_assignment_id_student_id_attempt_num_key unique (assignment_id, student_id, attempt_number),
  constraint assignment_submissions_assignment_id_fkey foreign KEY (assignment_id) references assignments (id) on delete CASCADE,
  constraint assignment_submissions_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE,
  constraint assignment_submissions_attempt_number_check check ((attempt_number > 0)),
  constraint assignment_submissions_status_check check (
    (
      status = any (
        array[
          'draft'::text,
          'submitted'::text,
          'graded'::text,
          'returned'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_submissions_assignment on public.assignment_submissions using btree (assignment_id) TABLESPACE pg_default;

create index IF not exists idx_submissions_assignment_id on public.assignment_submissions using btree (assignment_id) TABLESPACE pg_default;

create index IF not exists idx_submissions_student_id on public.assignment_submissions using btree (student_id) TABLESPACE pg_default;

create index IF not exists idx_submissions_status on public.assignment_submissions using btree (status) TABLESPACE pg_default;

create index IF not exists idx_submissions_submitted_at on public.assignment_submissions using btree (submitted_at) TABLESPACE pg_default;

create index IF not exists idx_submissions_student on public.assignment_submissions using btree (student_id) TABLESPACE pg_default;

create index IF not exists idx_submissions_student_assignment on public.assignment_submissions using btree (student_id, assignment_id) TABLESPACE pg_default;

create table public.assignments (
  id uuid not null default gen_random_uuid (),
  title text not null,
  description text null,
  instructions text null,
  course_id uuid not null,
  lesson_id uuid null,
  created_by uuid not null,
  assignment_type text not null,
  max_points integer null default 100,
  due_date timestamp with time zone null,
  allow_late_submission boolean null default true,
  late_penalty_percent integer null default 0,
  max_attempts integer null default 1,
  time_limit_minutes integer null,
  is_published boolean null default false,
  requires_file_upload boolean null default false,
  allowed_file_types text[] null,
  max_file_size_mb integer null default 10,
  rubric jsonb null default '[]'::jsonb,
  auto_grade boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  points_possible integer null,
  status text null default 'draft'::text,
  subject text null,
  constraint assignments_pkey primary key (id),
  constraint assignments_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint assignments_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint assignments_created_by_fkey foreign KEY (created_by) references users (id) on delete CASCADE,
  constraint assignments_status_check check (
    (
      status = any (
        array[
          'draft'::text,
          'published'::text,
          'archived'::text
        ]
      )
    )
  ),
  constraint assignments_assignment_type_check check (
    (
      assignment_type = any (
        array[
          'essay'::text,
          'quiz'::text,
          'project'::text,
          'homework'::text,
          'presentation'::text,
          'other'::text
        ]
      )
    )
  ),
  constraint check_due_date_future check ((due_date > created_at)),
  constraint assignments_late_penalty_percent_check check (
    (
      (late_penalty_percent >= 0)
      and (late_penalty_percent <= 100)
    )
  ),
  constraint assignments_max_attempts_check check ((max_attempts > 0)),
  constraint assignments_max_points_check check ((max_points > 0))
) TABLESPACE pg_default;

create index IF not exists idx_assignments_course_id on public.assignments using btree (course_id) TABLESPACE pg_default;

create index IF not exists idx_assignments_due_date on public.assignments using btree (due_date) TABLESPACE pg_default;

create index IF not exists idx_assignments_published on public.assignments using btree (is_published) TABLESPACE pg_default;

create index IF not exists idx_assignments_course_due_date on public.assignments using btree (course_id, due_date) TABLESPACE pg_default;

create table public.chat_sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title text not null default 'New Chat'::text,
  subject text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint chat_sessions_pkey primary key (id),
  constraint chat_sessions_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_chat_sessions_user_id on public.chat_sessions using btree (user_id) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on chat_sessions for EACH row
execute FUNCTION handle_updated_at ();

create table public.course_enrollments (
  id uuid not null default gen_random_uuid (),
  course_id uuid not null,
  student_id uuid not null,
  enrolled_at timestamp with time zone not null default timezone ('utc'::text, now()),
  completed_at timestamp with time zone null,
  progress_percentage integer null default 0,
  constraint course_enrollments_pkey primary key (id),
  constraint course_enrollments_course_id_student_id_key unique (course_id, student_id),
  constraint course_enrollments_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint course_enrollments_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE,
  constraint course_enrollments_progress_percentage_check check (
    (
      (progress_percentage >= 0)
      and (progress_percentage <= 100)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_course_enrollments_student on public.course_enrollments using btree (student_id) TABLESPACE pg_default;

create index IF not exists idx_course_enrollments_course on public.course_enrollments using btree (course_id) TABLESPACE pg_default;

create table public.courses (
  id uuid not null default gen_random_uuid (),
  title text not null,
  description text null,
  subject_id uuid null,
  instructor_id uuid not null,
  level text null,
  is_active boolean null default true,
  thumbnail_url text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  duration_weeks integer null,
  estimated_hours integer null,
  constraint courses_pkey primary key (id),
  constraint courses_instructor_id_fkey foreign KEY (instructor_id) references users (id) on delete CASCADE,
  constraint courses_subject_id_fkey foreign KEY (subject_id) references subjects (id) on delete CASCADE,
  constraint courses_level_check check (
    (
      level = any (
        array[
          'beginner'::text,
          'intermediate'::text,
          'advanced'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create table public.lesson_progress (
  id uuid not null default gen_random_uuid (),
  lesson_id uuid not null,
  student_id uuid not null,
  completed_at timestamp with time zone null,
  time_spent_minutes integer null default 0,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint lesson_progress_pkey primary key (id),
  constraint lesson_progress_lesson_id_student_id_key unique (lesson_id, student_id),
  constraint lesson_progress_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint lesson_progress_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.lesson_progress (
  id uuid not null default gen_random_uuid (),
  lesson_id uuid not null,
  student_id uuid not null,
  completed_at timestamp with time zone null,
  time_spent_minutes integer null default 0,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint lesson_progress_pkey primary key (id),
  constraint lesson_progress_lesson_id_student_id_key unique (lesson_id, student_id),
  constraint lesson_progress_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint lesson_progress_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.lesson_progress (
  id uuid not null default gen_random_uuid (),
  lesson_id uuid not null,
  student_id uuid not null,
  completed_at timestamp with time zone null,
  time_spent_minutes integer null default 0,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint lesson_progress_pkey primary key (id),
  constraint lesson_progress_lesson_id_student_id_key unique (lesson_id, student_id),
  constraint lesson_progress_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint lesson_progress_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text null,
  is_read boolean null default false,
  action_url text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  is_global boolean null default false,
  target character varying(50) null,
  sender_id uuid null,
  channels jsonb null default '["in-app"]'::jsonb,
  recipients text null default 'all'::text,
  priority text null default 'medium'::text,
  status text null default 'sent'::text,
  constraint notifications_pkey primary key (id),
  constraint notifications_sender_id_fkey foreign KEY (sender_id) references users (id),
  constraint notifications_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint notifications_type_check check (
    (
      type = any (
        array[
          'info'::text,
          'warning'::text,
          'success'::text,
          'error'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create table public.quiz_attempts (
  id uuid not null default gen_random_uuid (),
  quiz_id uuid not null,
  student_id uuid not null,
  answers jsonb not null default '[]'::jsonb,
  score integer not null default 0,
  max_score integer not null,
  time_taken_minutes integer null,
  started_at timestamp with time zone not null default timezone ('utc'::text, now()),
  completed_at timestamp with time zone null,
  is_passed boolean null default false,
  constraint quiz_attempts_pkey primary key (id),
  constraint quiz_attempts_quiz_id_fkey foreign KEY (quiz_id) references quizzes (id) on delete CASCADE,
  constraint quiz_attempts_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.quizzes (
  id uuid not null default gen_random_uuid (),
  lesson_id uuid null,
  course_id uuid null,
  title text not null,
  description text null,
  questions jsonb not null default '[]'::jsonb,
  time_limit_minutes integer null,
  max_attempts integer null default 3,
  passing_score integer null default 70,
  is_published boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint quizzes_pkey primary key (id),
  constraint quizzes_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint quizzes_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.study_sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  subject_id uuid null,
  course_id uuid null,
  session_name text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone null,
  duration_minutes integer null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint study_sessions_pkey primary key (id),
  constraint study_sessions_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint study_sessions_subject_id_fkey foreign KEY (subject_id) references subjects (id) on delete CASCADE,
  constraint study_sessions_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.subjects (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  icon text null,
  color text null default '#3B82F6'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint subjects_pkey primary key (id),
  constraint subjects_name_key unique (name)
) TABLESPACE pg_default;

create table public.user_achievements (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  achievement_type text not null,
  achievement_name text not null,
  description text null,
  earned_at timestamp with time zone not null default timezone ('utc'::text, now()),
  metadata jsonb null default '{}'::jsonb,
  constraint user_achievements_pkey primary key (id),
  constraint user_achievements_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.user_profiles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  avatar_url text null,
  bio text null,
  phone text null,
  address text null,
  date_of_birth date null,
  learning_preferences jsonb null default '{}'::jsonb,
  notification_settings jsonb null default '{"push": true, "email": true}'::jsonb,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.user_progress (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  subject text not null,
  topic text not null,
  progress_data jsonb null default '{}'::jsonb,
  last_studied timestamp with time zone not null default timezone ('utc'::text, now()),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_progress_pkey primary key (id),
  constraint user_progress_user_id_subject_topic_key unique (user_id, subject, topic),
  constraint user_progress_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_progress_user_id on public.user_progress using btree (user_id) TABLESPACE pg_default;

create table public.users (
  id uuid not null default gen_random_uuid (),
  email text not null,
  name text not null,
  role text not null default 'student'::text,
  avatar_url text null,
  preferences jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  password text null,
  first_name text null,
  last_name text null,
  phone text null,
  address text null,
  bio text null,
  avatar text null,
  birth_date date null,
  website text null,
  github text null,
  linkedin text null,
  twitter text null,
  specialization text null,
  years_of_experience text null,
  education text null,
  status text not null default 'active'::text,
  is_suspended boolean null default false,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_role_check check (
    (
      role = any (
        array['admin'::text, 'student'::text, 'staff'::text]
      )
    )
  ),
  constraint users_status_check check (
    (
      status = any (
        array[
          'active'::text,
          'inactive'::text,
          'suspended'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_users_first_name on public.users using btree (first_name) TABLESPACE pg_default;

create index IF not exists idx_users_last_name on public.users using btree (last_name) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on users for EACH row
execute FUNCTION handle_updated_at ();
