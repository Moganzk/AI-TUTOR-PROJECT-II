INSERT INTO subjects (id, name)
VALUES ('d0f97a47-3d14-4f88-8c80-994dd5abf365', 'Programming');


INSERT INTO courses (
  id,
  title,
  description,
  subject_id,
  instructor_id,
  level,
  is_active,
  duration_weeks,
  estimated_hours,
  created_at,
  updated_at
)
VALUES (
  '5a502a3e-8f3c-45e4-a9f1-f4bde4e3ad25',
  'Python Fundamentals',
  'An introductory course to Python programming covering syntax, control flow, functions, and data structures.',
  'd0f97a47-3d14-4f88-8c80-994dd5abf365',  -- We'll insert this subject next
  'eb96c9ea-aa5e-4136-9a9f-982355cbaf05',  -- Staff Demo
  'beginner',
  TRUE,
  6,
  20,
  NOW(),
  NOW()
);

INSERT INTO course_enrollments (
  id,
  course_id,
  student_id,
  enrolled_at
)
VALUES (
  '1d2aeb77-4d96-4346-bfcf-6012bba7165c',
  '5a502a3e-8f3c-45e4-a9f1-f4bde4e3ad25',  -- Python Fundamentals
  '83cc124a-1ccd-4cf2-adee-26bf936d88d6',  -- Student Demo
  NOW()
);

//verify enrollment
SELECT
  e.id AS enrollment_id,
  u.name AS student_name,
  c.title AS course_title,
  e.enrolled_at
FROM course_enrollments e
JOIN users u ON e.student_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE u.id = '83cc124a-1ccd-4cf2-adee-26bf936d88d6'
  AND c.id = '5a502a3e-8f3c-45e4-a9f1-f4bde4e3ad25';


INSERT INTO lessons (
  id,
  course_id,
  title,
  content,
  lesson_order,
  created_at,
  updated_at
)
VALUES (
  'fa12ef44-91d2-4120-bcb4-94d1de6bb0e4',
  '5a502a3e-8f3c-45e4-a9f1-f4bde4e3ad25',
  'Introduction to Python',
  'This lesson introduces Python programming basics: variables, syntax, and print statements.',
  1,
  NOW(),
  NOW()
);

INSERT INTO lesson_progress (
  id,
  lesson_id,
  student_id,
  time_spent_minutes,
  notes,
  completed_at,
  created_at
)
VALUES (
  'c2ad5be1-127f-43c1-b6c2-d4ef16df35c6',
  'fa12ef44-91d2-4120-bcb4-94d1de6bb0e4',  -- Lesson: Intro to Python
  '83cc124a-1ccd-4cf2-adee-26bf936d88d6',  -- Student Demo
  35,
  'Watched video, wrote hello world.',
  NOW(),  -- Marked as completed now
  NOW()
);

SELECT
  u.name AS student,
  l.title AS lesson,
  lp.time_spent_minutes,
  lp.completed_at
FROM lesson_progress lp
JOIN lessons l ON lp.lesson_id = l.id
JOIN users u ON lp.student_id = u.id
WHERE u.id = '83cc124a-1ccd-4cf2-adee-26bf936d88d6';

INSERT INTO assignments (
  id,
  title,
  description,
  instructions,
  course_id,
  lesson_id,
  created_by,
  assignment_type,
  max_points,
  due_date,
  is_published,
  allow_late_submission,
  created_at,
  updated_at
)
VALUES (
  '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
  'Python Basics Quiz',
  'Quiz covering Python syntax, variables, and control flow.',
  'Answer all questions carefully. You have one attempt.',
  '5a502a3e-8f3c-45e4-a9f1-f4bde4e3ad25', -- Python Fundamentals
  'fa12ef44-91d2-4120-bcb4-94d1de6bb0e4', -- Lesson: Intro to Python
  'eb96c9ea-aa5e-4136-9a9f-982355cbaf05', -- Staff Demo
  'quiz',
  10,
  NOW() + INTERVAL '7 days',
  TRUE,
  TRUE,
  NOW(),
  NOW()
);


SELECT
  a.id,
  a.title,
  a.due_date,
  a.assignment_type,
  a.is_published
FROM assignments a
WHERE a.course_id = '5a502a3e-8f3c-45e4-a9f1-f4bde4e3ad25';


INSERT INTO assignment_questions (
  id,
  assignment_id,
  question_text,
  question_type,
  options,
  correct_answer,
  points,
  order_index,
  created_at,
  updated_at
)
VALUES (
  'd6a4fcf1-1b49-4f0e-8e26-23634fa2197e',
  '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',  -- Python Basics Quiz
  'What is the output of: print(2 + 3)?',
  'multiple_choice',
  ARRAY['23', '5', '2 + 3'],
  '5',
  5,
  1,
  NOW(),
  NOW()
);


SELECT
  question_text,
  question_type,
  options,
  correct_answer
FROM assignment_questions
WHERE assignment_id = '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871';


INSERT INTO assignment_submissions (
  id,
  assignment_id,
  student_id,
  attempt_number,
  status,
  submitted_at,
  is_late,
  late_minutes,
  created_at,
  updated_at
)
VALUES (
  '3b542f25-45eb-4d6f-939f-9efb72d310c2',
  '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',  -- Python Basics Quiz
  '83cc124a-1ccd-4cf2-adee-26bf936d88d6',  -- Student Demo
  1,
  'submitted',
  NOW(),
  FALSE,
  0,
  NOW(),
  NOW()
);


SELECT
  s.id,
  s.assignment_id,
  s.status,
  s.submitted_at,
  u.name AS student
FROM assignment_submissions s
JOIN users u ON s.student_id = u.id
WHERE s.assignment_id = '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871';


INSERT INTO assignment_answers (
  id,
  submission_id,
  question_id,
  selected_option,
  created_at
)
VALUES (
  'd8ec0d91-50f6-4e31-a51b-33021f91b1b9',
  '3b542f25-45eb-4d6f-939f-9efb72d310c2',  -- Submission ID
  'd6a4fcf1-1b49-4f0e-8e26-23634fa2197e',  -- Question ID
  '5',
  NOW()
);


SELECT
  a.selected_option,
  q.question_text,
  q.correct_answer
FROM assignment_answers a
JOIN assignment_questions q ON a.question_id = q.id
WHERE a.submission_id = '3b542f25-45eb-4d6f-939f-9efb72d310c2';


CREATE OR REPLACE FUNCTION validate_assignment_points()
RETURNS TRIGGER AS $$
DECLARE
  max_points INTEGER;
BEGIN
  SELECT a.max_points
  INTO max_points
  FROM assignments a
  JOIN assignment_submissions s ON s.assignment_id = a.id
  WHERE s.id = NEW.submission_id;

  IF NEW.points_earned > max_points THEN
    RAISE EXCEPTION 'Points earned (%.2f) exceed max points (%) for the assignment.',
      NEW.points_earned, max_points;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


INSERT INTO notifications (
  id,
  user_id,
  title,
  message,
  created_at
)
VALUES (
  '3f2faaa5-e70f-4b7b-9474-78b0dd3f3bc9',
  '83cc124a-1ccd-4cf2-adee-26bf936d88d6',  -- Student Demo
  'Assignment Graded',
  'Your assignment "Python Basics Quiz" has been graded.',
  NOW()
);

SELECT
  c.title AS course,
  ROUND(AVG(g.percentage), 2) AS average_score
FROM assignment_grades g
JOIN assignment_submissions s ON g.submission_id = s.id
JOIN assignments a ON a.id = s.assignment_id
JOIN courses c ON a.course_id = c.id
GROUP BY c.title;

INSERT INTO assignment_questions (
  id, assignment_id, question_text, question_type,
  options, correct_answer, points, order_index,
  created_at, updated_at
)
VALUES
-- Q1
('a1f1c0f7-b543-4c64-a421-917e3916e0c1',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'What is the correct way to assign the integer value 10 to a variable named x?',
 'multiple_choice',
 ARRAY['int x = 10', 'x = 10', 'x : int = 10', 'var x = 10'],
 'x = 10', 1, 1, NOW(), NOW()),

-- Q2
('3b4798f0-c267-4ae7-8bc3-5ea0cb1df52a',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'What is the output of the following code?\n\nx = 5\ny = "5"\nprint(x + int(y))',
 'multiple_choice',
 ARRAY['10', '55', 'TypeError', '"10"'],
 '10', 1, 2, NOW(), NOW()),

-- Q3
('932d720a-2ff4-45df-b0ea-934437270db8',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'Strings in Python are mutable.',
 'true_false',
 NULL,
 'False', 1, 3, NOW(), NOW()),

-- Q4
('d3f89e47-8a79-4cc9-a2a4-1b9b14734e52',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'What built-in function is used to check the data type of a variable?',
 'text',
 NULL,
 'type()', 1, 4, NOW(), NOW()),

-- Q5
('f0a6dd98-d26c-45d3-9d1f-9489055c22e9',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'What is the result of 10 % 3 in Python?',
 'multiple_choice',
 ARRAY['1', '3', '0', '10.0'],
 '1', 1, 5, NOW(), NOW()),

-- Q6
('3e1f3b4c-5ae1-4e59-8921-70323cb88d30',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'Which of the following data types is not a built-in Python type?',
 'multiple_choice',
 ARRAY['int', 'str', 'decimal', 'bool'],
 'decimal', 1, 6, NOW(), NOW()),

-- Q7
('99e4e531-18d0-4b6e-9447-d1d1761a8ea2',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'In Python, you can reassign a variable to a value of a different data type.',
 'true_false',
 NULL,
 'True', 1, 7, NOW(), NOW()),

-- Q8
('25cb08e7-6e52-4323-b546-d8a94cc9eae9',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'Briefly explain the difference between = and == in Python.',
 'essay',
 NULL,
 '= is assignment, == is equality comparison', 1, 8, NOW(), NOW()),

-- Q9
('ea0d74b5-4693-48c3-8f4f-6f96e879b9c5',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'What is the output of:\n\na = 5\nb = 3\nprint(a > 2 and b < 5)',
 'multiple_choice',
 ARRAY['True', 'False', 'None', 'Error'],
 'True', 1, 9, NOW(), NOW()),

-- Q10
('04e01ff8-6be3-4aef-b85c-27a0058f1088',
 '8fcf89d9-e9f0-4e46-b79f-8632e6f7f871',
 'Which keyword is used to declare a constant in Python?',
 'text',
 NULL,
 'There is no keyword; use ALL_CAPS naming convention.', 1, 10, NOW(), NOW());



INSERT INTO lessons (
  id,
  course_id,
  title,
  content,
  lesson_order,
  created_at,
  updated_at
)
VALUES (
  'c5b998e1-1a2e-4022-b0e5-80a4960e48e4',
  '5a502a3e-8f3c-45e4-a9f1-f4bde4e3ad25',  -- Python Fundamentals
  'Variables, Data Types & Operators',
  'This lesson covers Python variables, basic data types (int, float, str, bool), and arithmetic/comparison/logical operators. You will learn how to declare variables, perform calculations, and apply logical expressions.',
  2,
  NOW(),
  NOW()
);

UPDATE lessons
SET content = $$
<h2>Lesson Overview</h2>
<p>This lesson introduces you to one of the most important foundations of Python programming: variables, data types, and operators.</p>

<h2>🎯 Learning Objectives</h2>
<ul>
  <li>Understand how to declare and assign values to variables</li>
  <li>Identify different data types (int, float, str, bool)</li>
  <li>Use arithmetic, comparison, and logical operators effectively</li>
  <li>Convert between data types (type casting)</li>
  <li>Apply basic logic in real-world scenarios using Python expressions</li>
</ul>

<h2>📚 What You'll Learn</h2>
<ol>
  <li>Declaring variables with appropriate names</li>
  <li>Working with strings, numbers, and booleans</li>
  <li>Understanding mutable vs immutable types</li>
  <li>Performing calculations using `+`, `-`, `*`, `/`, `%`</li>
  <li>Comparing values using `==`, `!=`, `>`, `<`, `>=`, `<=`</li>
  <li>Using logical operators: `and`, `or`, `not`</li>
</ol>

<h2>💡 Tips</h2>
<ul>
  <li>Remember: Python is dynamically typed, but types still matter.</li>
  <li>Use the <code>type()</code> function to check a variable's type.</li>
  <li>Use comments <code># like this</code> to explain your logic as you go.</li>
</ul>

<h2>🧪 What's Next?</h2>
<p>After reviewing the materials and watching the video, attempt the assignment titled <strong>"Mastering Python Basics: Variables, Types & Operators"</strong>.</p>
$$,
updated_at = NOW()
WHERE id = 'c5b998e1-1a2e-4022-b0e5-80a4960e48e4';
