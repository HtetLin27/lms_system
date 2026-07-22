import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

class LessonProgress extends Model {}

LessonProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enrollment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lesson_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'LessonProgress',
    tableName: 'lesson_progress',
    timestamps: false,
  }
);

export default LessonProgress;
