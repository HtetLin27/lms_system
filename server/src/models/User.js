import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/database.js";

class User extends Model {
  async comparePassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password_hash);
  }
  toJSON() {
    const values = super.toJSON();
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Name must be between 2 and 100 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Must be a valid email address" },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "instructor", "admin"),
      allowNull: false,
      defaultValue: "student",
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: "User",
    tableName: "users",
    timestamps: false,
  },
);

User.beforeCreate(async (user) => {
  user.password_hash = await bcrypt.hash(user.password_hash, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed("password_hash")) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

export default User;
