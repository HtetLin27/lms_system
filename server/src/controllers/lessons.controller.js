import { sequelize } from '../config/database.js'
import { Course, Lesson, Enrollment} from '../models/index.js'
import { isCourseOwner, canAccessLesson } from '../utils/ownership.js'
import r2Service from '../services/r2.service.js'

const findCourse = async(slug) => {
    const course = await Course.findOne({ where: {slug}});
    return course;
}

const lessonBelongsToCourse = (lesson, courseId) => lesson.course_id === courseId;


const listLessons = async (req, res, next) => {
    try {
        const course = await findCourse(req.params.slug);
        if(!course) return res.status(404).json({ error: 'Course not found'});

        const lessons = await Lesson.findAll({ 
            where: {course_id : course.id},
            order: [['order_index','ASC']],
            attributes: [
                'id','title','content_type','order_index','duration_seconds','is_preview','created_at'
            ]
        })
        return res.status(200).json({ lessons });
         
    } catch (error) {
        next(error)
    }
}

const getLesson = async (req, res, next) =>{
    try {
        const course = await findCourse(req.params.slug);
        if(!course) return res.status(404).json({ error: 'Course not found'});

        const lesson = await Lesson.findByPk(req.params.id);
        if(!lesson) return res.status(404).json({ error: 'Lesson not found'});

        if(!lessonBelongsToCourse(lesson, course.id)){
            return res.status(404).json({ error: 'Lesson not found'})
        }
        
        const hasAccess = await canAccessLesson(req.user, lesson, course, Enrollment);
        if(!hasAccess){
            return res.status(403).json({
                error: 'Enroll in this course to access lesson content',
                courseSlug: course.slug
            })
        }

        const lessonData = lesson.toJSON();
        
        if(lesson.content_type === 'video' && lesson.file_url){
            lessonData.video_url = await r2Service.getSignedFileUrl(lesson.file_url);

            if(req.user?.role === 'student'){
                delete lessonData.file_url
            }
        }
        if(lesson.content_type === 'pdf' && lesson.file_url){
            lessonData.pdf_url = await r2Service.getSignedFileUrl(lesson.file_url);
            if(req.user?.role === 'student'){
                delete lessonData.file_url;
            }
        }

        return res.status(200).json({ lesson: lessonData })
    } catch (error) {
        next(error)
    }
}


const createLesson = async (req, res, next) => {
    try {
        const course = await findCourse(req.params.slug);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        if(!isCourseOwner(req.user, course)){
            return res.status(403).json({ error: 'Not your course' });
        }

        const {
            title,
            content_type,
            file_url,
            content,
            duration_seconds,
            is_preview = false
        } = req.body;

        const maxOrder = await Lesson.max('order_index',{
            where: { course_id: course.id}
        })
        const order_index = (maxOrder ?? -1) + 1;

        const lesson = await Lesson.create({
            course_id: course.id,
            title,
            content_type,
            file_url: file_url || null,
            content: content || null,
            order_index,
            duration_seconds: duration_seconds || null,
            is_preview
        })

        return res.status(201).json({
            message: 'Lesson created',
            lesson
        })
    } catch (error) {
        next(error)
    }
}

const updateLesson = async (req, res, next) => {
  try {
    const course = await findCourse(req.params.slug);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!isCourseOwner(req.user, course)) {
      return res.status(403).json({ error: 'Not your course' });
    }

    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    if (!lessonBelongsToCourse(lesson, course.id)) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const allowed = ['title', 'content', 'file_url', 'is_preview', 'duration_seconds'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.file_url && lesson.file_url &&
        updates.file_url !== lesson.file_url &&
        lesson.content_type !== 'text') {
      r2Service.deleteFile(lesson.file_url).catch(console.error);
    }

    updates.updated_at = new Date();
    await lesson.update(updates);

    return res.status(200).json({ message: 'Lesson updated', lesson });
  } catch (err) { next(err); }
};

const reorderLessons = async (req, res, next) => {
  try {
    const course = await findCourse(req.params.slug);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!isCourseOwner(req.user, course)) {
      return res.status(403).json({ error: 'Not your course' });
    }

    const { lessons } = req.body;
    // lessons = [{ id: 'uuid-a', order_index: 0 }, { id: 'uuid-b', order_index: 1 }, ...]

    // Verify all lesson IDs belong to this course before updating any
    // Why verify all first:
    //   If we update one by one and fail midway, the order is partially
    //   changed — an inconsistent state. Verify all then update all.
    const lessonIds = lessons.map(l => l.id);
    const existing  = await Lesson.findAll({
      where: { id: lessonIds, course_id: course.id },
      attributes: ['id'],
    });

    if (existing.length !== lessons.length) {
      return res.status(400).json({
        error: 'Some lesson IDs are invalid or do not belong to this course',
      });
    }

    // Update all in a single transaction
    // Why transaction:
    //   If lesson 3's update fails after lessons 1 and 2 already updated,
    //   we would have a partially reordered list. The transaction rolls back
    //   all changes if any single update fails — the order stays consistent.
    await sequelize.transaction(async (t) => {
      await Promise.all(
        lessons.map(({ id, order_index }) =>
          Lesson.update(
            { order_index, updated_at: new Date() },
            { where: { id }, transaction: t }
          )
        )
      );
    });

    // Fetch updated lessons to return
    const updated = await Lesson.findAll({
      where:      { course_id: course.id },
      order:      [['order_index', 'ASC']],
      attributes: ['id', 'title', 'content_type', 'order_index', 'duration_seconds', 'is_preview'],
    });

    return res.status(200).json({
      message: 'Lessons reordered',
      lessons: updated,
    });
  } catch (err) { next(err); }
};

const deleteLesson = async (req, res, next) => {
  try {
    const course = await findCourse(req.params.slug);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!isCourseOwner(req.user, course)) {
      return res.status(403).json({ error: 'Not your course' });
    }

    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    if (!lessonBelongsToCourse(lesson, course.id)) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const deletedOrder = lesson.order_index;

    // Destroy the lesson — beforeDestroy hook cleans up R2 file
    await lesson.destroy();

    // Resequence remaining lessons to fill the gap
    // Why resequence:
    //   Before delete: order_indexes 0, 1, 2, 3, 4
    //   Delete index 2: order_indexes 0, 1, 3, 4  ← gap at 2
    //   After resequence: 0, 1, 2, 3              ← clean sequence
    //   Without this, the order numbers drift and become confusing
    //   on the instructor dashboard.
    await Lesson.decrement('order_index', {
      where: {
        course_id:   course.id,
        order_index: { [require('sequelize').Op.gt]: deletedOrder },
      },
    });

    return res.status(200).json({ message: 'Lesson deleted' });
  } catch (err) { next(err); }
};

export {
    listLessons,
    getLesson,
    createLesson,
    updateLesson,
    reorderLessons,
    deleteLesson,
}