import { Op } from "sequelize";
import { Course, User, Category, Enrollment, Lesson } from "../models/index.js";
import { isCourseOwner } from "../utils/ownership.js";
import { buildCourseScope, canViewCourse } from "../utils/courseScope.js";
import r2Service from "../services/r2.service.js"

const listCourses = async (req, res, next) => {
    try{
        const { 
            page = 1, 
            limit = 12, 
            level,
            category,
            search,
            sort = 'created_at',
            } = req.query;
        
        const where = buildCourseScope(req.user);
        if(level) where.level = level;
        if(search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }

        const order = [[sort, 'DESC']];

        const include = [
            {
                model : Category,
                as : 'category',
                attributes : ['id', 'name','slug'],
                required : false,
                ...(category ? { where: { slug: category } } : {})
            },
            {
                model : User,
                as : 'instructor',
                attributes : ['id', 'name', 'avatar_url', 'bio']
            }
        ]

        const offset = (page - 1) * limit;

        const { count, rows: courses } = await Course.findAndCountAll({
            where,
            inclue,
            order,
            limit: Number(limit),
            offset,
            distinct: true
        });

        let enrolledIds = new Set();
        if(req.user?.role === 'student'){
            const enrollments = await Enrollment.findAll({
                where: { student_id: req.user.id, status: 'active' },
                attributes: ['course_id'],
                raw: true,
            });
            enrolledIds = new Set(enrollments.map(e => e.course_id));
        }

        const enriched = courses.map(course => ({
            ...course.toJSON(),
            isEnrolled: enrolledIds.has(course.id)
        }));

        return res.status(200).json({
            courses: enriched,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / limit),
                hasNext: page < Math.ceil(count / limit),
                hasPrev: page > 1
            }
        });
    }catch(error){
        next(error);
    }
}

const getMyCourses = async (req, res, next) => {
    try{
        const courses = await Course.findAll({
            where: { instructor_id: req.user.id},
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
            ],
            order: [['created_at', 'DESC']]
        });
        
        const enriched = await Promise.all(courses.map(async course => {
            const lessonCount = await Lesson.count({ where: { course_id: course.id } });
            return {...course.toJSON(), lessonCount };
        }))
        return res.status(200).json({ courses: enriched });
    }catch(error){
        next(error);
    }
}

const getCourse = async (req, res, next) => {
    try{
        const course = await Course.findOne({
            where: { slug: req.params.slug },
            include: [
                { model: User, as: 'instructor', attributes: [
                    'id', 'name', 'avatar_url', 'bio'
                ]},
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: Lesson, as: 'lessons' , attributes: ['id', 'title', 'content_type', 'order_index', 'duration_seconds', 'is_preview'], order: [['order_index', 'ASC']] }
            ]
        });
        if(!course) return res.status(404).json({ message: 'Course not found' });

        if(!canViewCourse(req.user, course)){
            return res.status(404).json({ error: 'Course not found' });
        }

        let isEnrolled = false;
        if(req.user?.role === 'student'){
            const enrollment = await Enrollment.findOne({
                where: { student_id: req.user.id,
                    course_id: course.id,
                    status: 'active' 
                }
            });
            isEnrolled = !!enrollment;
        }
        const lessonCount = course.lessons?.length || 0;
        
        return res.status(200).json({
            course:{
                ...course.toJSON(),
                isEnrolled,
                lessonCount
            }
        })
    }
    catch(error){
        next(error);
    }
}

const createCourse = async (req, res, next) => {
    try{
        const {title, description, level, category_id, thumbnail_url } = req.body;

        if(category_id){
            const category = await Category.findByPk(category_id);
            if(!category) {
                return res.status(400).json({ error: 'Invalid category ID' });
            }
        }
        
        const course = await Course.create({
            title,
            description,
            level: level || 'beginner',
            category_id: category_id || null,
            thumbnail_url: thumbnail_url || null,
            instructor_id: req.user.id,
            status: 'draft'
        })

        const full = await Course.findByPk(course.id, {
            include: [
                { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar_url', ] },
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
            ]
        });

        return res.status(201).json({
            message: 'Course created successfully',
            course: full
        })
    }catch(error){
        next(error);
    }
}

const updateCourse = async (req, res, next) => {
    try{
        const course = await Course.findOne( { where: { slug: req.params.slug }});

        if(!course){
            return res.status(404).json({ error: 'Course not found'})
        }
        if(!isCourseOwner(req.user, course)){
            return res.status(403).json({ error: 'Not your course' });
        }

        if(course.status === 'published' && req.user.role !== 'admin'){
            return res.status(422).json({ error: 'Cannot edit a published course. Submit for review first.' });
        }

        const allowed = ['title', 'description', 'level', 'category_id', 'thumbnail_url'];
        const updates = {};
        allowed.forEach (field => {
            if(req.body[field] !== undefined) updates[field] = req.body[field];
        });

        if(updates.thumbnail_url && course.thumbnail_url && updates.thumbnail_url !== course.thumbnail_url){
            const oldKey = r2Service.getKeyFromUrl(course.thumbnail_url);
            if(oldKey) r2Service.deleteFile(oldKey);
        }

        await course.update(updates);
        return res.status(200).json({ message:'Course updated successfully', course
        })
    }
    catch(error){
        next(error);
    }
}

const submitForRevie = async (req, res, next) => {
    try{
        const course = await Course.findOne ( { where: { slug: req.params.slug}, include: [
            { model: Lesson, as: 'lessons'}
        ]});

        if(!course) return res.status(404).json({error: 'Course not found'})
        if(!isCourseOwner(req.user, course)){
            return res.status(403).json({ error: 'Not your course' });
        }
        if(!['draft', 'rejected'].includes(course.status)){
            return res.status(422).json({ error: 'Only draft or rejected courses can be submitted for review', currentStatus: course.status });
        }

        if(!course.lessons || course.lessons.length === 0){
            return res.status(422).json({ error: 'Course must have at least one lesson before submitting for review' });
        }
        await course.update({ status: 'pending' });

        return res.status(200).json({ message: 'Course submitted for review successfully', course });
    }catch(error){
        next(error);
    }
}

const publishCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (course.status !== 'pending') {
      return res.status(422).json({
        error:   `Can only publish pending courses. Current status: ${course.status}`,
      });
    }

    await course.update({ status: 'published' });

    return res.status(200).json({
      message: 'Course published successfully',
      course,
    });

  } catch (err) { next(err); }
};


const rejectCourse = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        error: 'A rejection reason of at least 10 characters is required',
      });
    }

    const course = await Course.findOne({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (course.status !== 'pending') {
      return res.status(422).json({
        error: `Can only reject pending courses. Current status: ${course.status}`,
      });
    }

    await course.update({ status: 'rejected' });


    return res.status(200).json({
      message: 'Course rejected',
      reason,
      course,
    });

  } catch (err) { next(err); }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ where: { slug: req.params.slug } });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!isCourseOwner(req.user, course)) {
      return res.status(403).json({ error: 'Not your course' });
    }

    if (course.status === 'published' && req.user.role !== 'admin') {
      return res.status(422).json({
        error: 'Cannot delete a published course with enrolled students',
      });
    }

    if (course.thumbnail_url) {
      const key = r2Service.getKeyFromUrl(course.thumbnail_url);
      if (key) r2Service.deleteFile(key); // fire and forget
    }

    await course.destroy();

    return res.status(200).json({ message: 'Course deleted successfully' });

  } catch (err) { next(err); }
};

export  {
    listCourses,
    getMyCourses,
    getCourse,
    createCourse,
    updateCourse,
    submitForRevie,
    publishCourse,
    rejectCourse,
    deleteCourse
}
