import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import CommentModel from "../Comments/model.js";
import ExperienceModel from "../experiences/model.js";
import PostModel from "../posts/model.js";

const UserModel = sequelize.define("user", {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 20],
    },
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 20],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  bio: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 500],
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 20],
    },
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
});

// User with many experiences, experience with one user

UserModel.hasMany(ExperienceModel, {
  foreignKey: { name: "userId", allowNull: false },
});
ExperienceModel.belongsTo(UserModel, {
  foreignKey: { name: "userId", allowNull: false },
});
// User with many posts, post with one user

UserModel.hasMany(PostModel, {
  foreignKey: { name: "userId", allowNull: false },
});
PostModel.belongsTo(UserModel, {
  foreignKey: { name: "userId", allowNull: false },
});

// User with many comments, comment with one user

UserModel.hasMany(CommentModel, {
  foreignKey: { name: "userId", allowNull: false },
});
CommentModel.belongsTo(UserModel, {
  foreignKey: { name: "userId", allowNull: false },
});

export default UserModel;
