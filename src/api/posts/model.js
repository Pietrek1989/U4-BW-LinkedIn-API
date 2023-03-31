import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import CommentModel from "../Comments/model.js";

const PostModel = sequelize.define("post", {
  postId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 200],
    },
  },
  image: { type: DataTypes.STRING, allowNull: true, default: "" },
});

// Post with one Comments, comment with one post
PostModel.hasMany(CommentModel, {
  foreignKey: { name: "postId", allowNull: false },
});
CommentModel.belongsTo(PostModel, {
  foreignKey: { name: "postId", allowNull: false },
});
export default PostModel;
