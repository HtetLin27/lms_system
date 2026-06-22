import User from "./User.js";
import Course from './Course.js';
import Category from './Category.js';
import Lesson from './Lesson.js';
import Enrollment from './Enrollment.js';
// import LessonProgress from './LessonProgress.js';
// import Quiz from './Quiz.js';
// import Question from './Question.js';
// import Option from './Option.js';
// import QuizAttempt from './QuizAttempt.js';
// import Certificate from './Certificate.js';

// Associations

User.hasMany(Course, { foreignKey: 'instructor_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

Category.hasMany(Course,   { foreignKey: 'category_id', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(Enrollment,  { foreignKey: 'student_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// User.hasMany(QuizAttempt,  { foreignKey: 'student_id', as: 'quizAttempts' });
// QuizAttempt.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Course.hasMany(Lesson, { foreignKey: 'course_id', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Course.hasMany(Quiz, { foreignKey: 'course_id', as: 'quizzes' });
// Quiz.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Lesson.hasOne(Quiz, { foreignKey: 'lesson_id', as: 'quiz' });
// Quiz.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// Enrollment.hasMany(LessonProgress, { foreignKey: 'enrollment_id', as: 'lessonProgress' });
// LessonProgress.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

// Enrollment.hasOne(Certificate, { foreignKey: 'enrollment_id', as: 'certificate' });
// Certificate.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

// LessonProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
// Lesson.hasMany(LessonProgress, { foreignKey: 'lesson_id', as: 'progress' });

// Quiz.hasMany(Question, { foreignKey: 'quiz_id', as: 'questions' });
// Question.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });
// QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// Question.hasMany(Option, { foreignKey: 'question_id', as: 'options' });
// Option.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

export {
  User,
  Course,
  Category,
  Lesson,
  Enrollment,
  // LessonProgress,
  // Quiz,
  // Question,
  // Option,
  // QuizAttempt,
  // Certificate,
};
