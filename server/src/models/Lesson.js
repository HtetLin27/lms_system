import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import r2Service from '../services/r2.service.js';

class Lesson extends Model {}

Lesson.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' },
      },
    },
    content_type: {
      type: DataTypes.ENUM('video', 'pdf', 'text'),
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'lessons',
    modelName: 'Lesson',
    timestamps: false,
  }
);

Lesson.beforeDestroy(async (lesson) => {
  if (lesson.file_url && lesson.content_type !== 'text') {
    r2Service.deleteFile(lesson.file_url).catch((err) => {
      console.error('R2 cleanup failed for lesson', lesson.id, err.message);
    });
  }
});

export default Lesson;
