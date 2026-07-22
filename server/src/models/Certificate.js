import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

class Certificate extends Model {}

Certificate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enrollment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    verify_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    issued_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Certificate',
    tableName: 'certificates',
    timestamps: false,
  }
);

export default Certificate;
