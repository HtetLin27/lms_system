import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

class QuizAttempt extends Model {}

QuizAttempt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quiz_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    score_percent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    attempted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'QuizAttempt',
    tableName: 'quiz_attempts',
    timestamps: false,
  }
);

export default QuizAttempt;
