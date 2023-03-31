import Express from "express";
import createHttpError from "http-errors";
import commentSchema from "./model.js";
import postModel from "../posts/model.js";
import CommentModel from "./model.js";
import { Op } from "sequelize";

// export const isPostExisted = async (req, res, next) => {
//   const user = await postModel.findById(req.params.postId);
//   if (user) next();
//   else
//     next(createHttpError(404, `User with id ${req.params.postId} not found!`));
// };

const commentRouter = Express.Router();

commentRouter.post("/comments", async (req, res, next) => {
  try {
    const comment = await CommentModel.create({
      ...req.body,
      userId: req.body.userId,
      postId: req.body.postId, // set the foreign key to the user's ID
    });

    // const user = await UserModel.findByPk(req.body.userId);
    // if (user) {
    //   await user.addComment(comment);
    // }
    // const post = await PostModel.findByPk(req.body.postId);
    // if (post) {
    //   await post.addComment(post);
    // }
    res.status(201).send(comment);
  } catch (err) {
    next(err);
  }
});

commentRouter.get("/comments", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.comment)
      query.comment = { [Op.iLike]: `%${req.query.comment}%` };
    // if (req.query.userId) query.userId = req.query.userId;
    // if (req.query.postId) query.postId = { [Op.iLike]: `${req.query.postId}` };

    const comment = await CommentModel.findAndCountAll({
      where: { ...query },
      order: [["userId", "ASC"]],
      // limit,
      // offset,
      // attributes: ["firstName", "lastName"],
    });
    res.send({
      total: comment.rows.length,
      // offset,
      // limit,
      comment: comment.rows,
    });
  } catch (err) {
    next(err);
  }
});

commentRouter.get("/comments/post/:postId", async (req, res, next) => {
  try {
    // const limit = req.query.limit || 10;
    // const offset = req.query.offset || 0;
    const comments = await CommentModel.findAndCountAll({
      where: { postId: req.params.postId },
      order: [["postId", "ASC"]],
      // limit,
      // offset,
      // attributes: ["firstName", "lastName"],
    });
    res.send({
      total: comments.count,
      // offset,
      // limit,
      comments: comments.rows,
    });
  } catch (error) {
    next(error);
  }
});
commentRouter.get("comments/user/:user:id", async (req, res, next) => {
  try {
    const Comment = await commentSchema.findById(req.params.commentId);
    if (Comment) {
      res.send(Comment);
    } else {
      next(
        createHttpError(
          404,
          `Comment with the id of ${req.params.commentId} not found`
        )
      );
    }
  } catch (err) {
    next(err);
  }
});

commentRouter.get("/comments/single/:commentId", async (req, res, next) => {
  try {
    const comment = await CommentModel.findByPk(req.params.commentId);
    if (comment) {
      res.status(200).send(comment);
    } else
      next(
        createHttpError(
          404,
          `Comment with id ${req.params.commentId} not found!`
        )
      );
  } catch (err) {
    next(err);
  }
});

commentRouter.put("/comments/single/:commentId", async (req, res, next) => {
  try {
    const updatedComment = await CommentModel.update(req.body, {
      where: { commentId: req.params.commentId },
      returning: true,
    });
    if (updatedComment) res.send(updatedComment);
    else
      next(
        createHttpError(404, `Post with id ${req.params.commentId} not found!`)
      );
  } catch (err) {
    next(err);
  }
});

commentRouter.delete("/comments/single/:commentId", async (req, res, next) => {
  try {
    const deletedPost = await CommentModel.destroy({
      where: { postId: req.params.commentId },
    });

    if (deletedPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.commentId} not found!`)
      );
    }
  } catch (err) {
    next(err);
  }
});

export default commentRouter;
