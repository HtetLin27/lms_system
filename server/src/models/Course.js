import { Model, DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import slugify from 'slugify';

class Course extends Model {}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [5, 255],
          msg: 'Title must be between 5 and 255 characters',
        },
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: { args: [20, 5000], msg: 'Description must be between 20 and 5000 characters' },
      },
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected'),
      allowNull: false,
      defaultValue: 'draft',
    },
    level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner',
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
    timestamps: false,
  }
);

Course.beforeCreate(async (course) => {
  course.slug = await generateUniqueSlug(course.title);
});

Course.beforeUpdate(async (course) => {
  if (course.changed('title')) {
    course.slug = await generateUniqueSlug(course.title, course.id);
  }
  course.updated_at = new Date();
});

const generateUniqueSlug = async (title, excludeId = null) => {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  const where = { slug: base };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  const existing = await Course.findOne({ where });

  if (!existing) return base;

  const suffix = Math.random().toString(16).slice(2, 6);
  return `${base}-${suffix}`;
};

export default Course;
