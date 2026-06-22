import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class Enrollment extends Model{}

Enrollment.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    student_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
    course_id:{
        type: DataTypes.UUID,
        allowNull: false
    },
    status:{
        type: DataTypes.ENUM('active', 'completed', 'dropped'),
        allowNull: false,
        defaultValue: 'active'
    },
    progress_percent:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    enrolled_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    completed_at:{
        type: DataTypes.DATE,
        allowNull: true
    }
},{
    sequelize,
    modelName:'Enrollment',
    tableName:'enrollments',
    timestamps:false
}
)

export default Enrollment;