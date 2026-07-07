import { sequelize } from '../config/database';
import { Course, Lesson, Quiz, Question, Option, QuizAttempt, Enrollment }from '../models/index';
import { isCourseOwner, isEnrolled } from '../utils/ownership';
import { scoreQuizAttempt, getAttemptCount } from '../services/quiz.service';
import { recalculateProgress } from '../services/progress.service';

const createQuiz = async (req, res, next) => {
    try{
        const course = await Course.findOne({where: {slug: req.params.slug}});
        if(!course){
            return res.status(404).json({error: 'Course not found'});
        }
        if(!isCourseOwner(req.user, course)){
            return res.status(403).json({error: 'Not your course'});
        }

        const { title, lesson_id, pass_percent, max_attempts, questions } = req.body;
        
        if(lesson_id){
            const lesson = await Lesson.findOne({where: {id: lesson_id, course_id: course.id}});

            if(!lesson){
                return res.status(404).json({error: 'Lesson not found'});
            }
        }

        const quiz = await sequelize.transaction( async (t) => {
            const newQuiz = await Quiz.create( {
                course_id: course.id,
                lesson_id: lesson_id || null,
                title,
                pass_percent: pass_percent || 70,
                max_attempts: max_attempts || 3,
            }, { transaction: t });

            for(let i = 0; i < questions.length; i++){
                const q = questions[i];
                const newQuestion = await Question.create({
                    quiz_id: newQuiz.id,
                    body: q.body,
                    order_index: i,
                }, { transaction: t });
            
                for(let j = 0; j < q.optioins.length; j++){
                    const o = q.optioins[j];
                    await Option.create({
                        question_id: newQuestion.id,
                        text: o.text,
                        is_correct: o.is_correct,
                        order_index: j,
                    }, { transaction: t });
                }
            }
            return newQuiz;
        } );

        const fullQuiz = await Quiz.findByPk(quiz.id ,{
            include: [{
              model: Question,
              as: 'questions',
              include: [{
                model: Option,
                as: 'options'
              }],
              order: [['order_index', 'ASC']]
            }]
        })
    
        return res.status(201).json({ message: 'Quiz created', quiz: fullQuiz });

    }catch(error){
        next(error)
    }
}

const getQuiz = async (req, res, next) => {
    try{
        const course = await Course.findOne({where: {slug: req.params.slug}});
        if(!course){
            return res.status(404).json({error: 'Course not found'});
        }

        const owner = isCourseOwner(req.user, course);
        if(!owner){
            const enrolled = await isEnrolled(req.user.id, course.id, Enrollment);
            if(!enrolled){
                return res.status(403).json({ error: 'Enroll in this course to access the quiz'})
            }
        }

        const quiz = await Quiz.findOne({
            where:   { id: req.params.id, course_id: course.id },
            include: [{
                model:   Question,
                as:      'questions',
                include: [{ model: Option, as: 'options' }],
                order:   [['order_index', 'ASC']],
            }],
            });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const quizData = quiz.toJSON();
        if(!owner){
            quizData.questions = quizData.questions.map( q => ({
                ...q,
                options: q.options.map(({ is_correct, ...rest}) => rest)
            }))

            const attemptCount = await getAttemptCount(quiz.id, req.user.id);
            quizData.attemptsUsed = attemptCount;
            quizData.attemptsRemaining = Math.max(0, quiz.max_attempts - attemptCount );
        }

        return res.status(200).json({ quiz: quizData });


    }catch(error){
        next(error)
    }
}

const submitAttempt = async (req, res, next) => {
    try{
        const course = await Course.findOne({ where: {slug: req.params.slug}});
        if(!course){
            return res.status(404).json({error: 'Course not found'});
        }
        const quiz = await Quiz.findOne({ where: {id: req.params.id, course_id: course.id}});
        if(!quiz){
            return res.status(404).json({error: 'Quiz not found'});
        }

        const enrolled = await isEnrolled(req.user.id, course.id, Enrollment);
        if(!enrolled){
            return res.status(403).json({ error: 'Enroll in this course to submit the quiz'})
        }

        const attemptCount = await getAttemptCount(quiz.id, req.user.id);
        if(attemptCount >= quiz.max_attempts){
            return res.status(403).json({ 
              error: 'Maximum attempts reached for this quiz',
              attemptsUsed: attemptCount,
              maxAttempts: quiz.max_attempts,
            })
        }

        const { answers } = req.body;
        const { scorePercent, totalQuestions, correctCount } = await scoreQuizAttempt(quiz.id, answers);

        const passed = scorePercent >= quiz.pass_percent;
        
        const attempt = await QuizAttempt.create({
            quiz_id: quiz.id,
            student_id: req.user.id,
            score_percent: scorePercent,
            passed,
            answers,
        });

        let courseComplete = false;
        if(quiz.lesson_id === null && passed){
            const enrollment = await Enrollment.findOne({ where: { student_id: req.user.id, course_id: course.id, status: 'active'}});
            if(enrollment){
                const { justCompleted } = await recalculateProgress(enrollment.id);
                courseComplete = justCompleted;
            }
        }

        return res.status(201).json({
          message: passed ? 'Quiz passed!' : 'Quiz not passed — you can try again',
            attempt: {
                id:            attempt.id,
                scorePercent,
                passed,
                correctCount,
                totalQuestions,
                attemptedAt:   attempt.attempted_at,
            },
            attemptsRemaining: Math.max(0, quiz.max_attempts - attemptCount - 1),
            courseComplete,
            });
    }catch(error){
        next(error)
    }
}


const getMyAttempts = async (req, res, next) => {
    try{
        const attempts = await QuizAttempt.findAll({
            where: { quiz_id: req.params.id, student_id: req.user.id },
            order: [['attempted_at', 'DESC']],
            attributes: ['id', 'score_percent', 'passed', 'attempted_at'],
        })
        res.status(200).json({ attempts });
    }catch(error){
        next(error)
    }
}

export { createQuiz, getQuiz, submitAttempt, getMyAttempts };