import Express from "express";
import createHttpError from "http-errors";
import PostModel from "./model.js";

import UserModel from "../users/model.js";
import CommentModel from "../Comments/model.js";
import { Op } from "sequelize";

const PostsRouter = Express.Router();

PostsRouter.post("/posts/:userId", async (req, res, next) => {
  try {
    const post = await PostModel.create({
      ...req.body,
      userId: req.params.userId, // set the foreign key to the user's ID
    });
    const user = await UserModel.findByPk(req.params.userId);
    if (user) {
      await user.addPost(post);
    }
    res.status(201).send(post);
  } catch (err) {
    next(err);
  }
});

PostsRouter.get("/posts", async (req, res, next) => {
  try {
    const posts = await PostModel.findAndCountAll({
      // where: { ...query },
      order: [["userId", "ASC"]],
      // limit,
      // offset,
      include: [
        { model: UserModel, attributes: ["name"] },
        {
          model: CommentModel,
          attributes: ["comment"],
          include: [
            {
              model: UserModel,
              attributes: ["name", "surname"],
            },
          ],
        },
      ],
    });
    res.send({
      total: posts.count,
      // offset,
      // limit,
      posts: posts.rows,
    });
  } catch (error) {
    next(error);
  }
});

PostsRouter.get("/posts/:userId", async (req, res, next) => {
  try {
    // const limit = req.query.limit || 10;
    // const offset = req.query.offset || 0;
    const posts = await PostModel.findAndCountAll({
      where: { userId: req.params.userId },
      order: [["createdAt", "ASC"]],
      // limit,
      // offset,
      include: [
        { model: UserModel, attributes: ["name"] },
        {
          model: CommentModel,
          attributes: ["comment"],
          include: [
            {
              model: UserModel,
              attributes: ["name", "surname"],
            },
          ],
        },
      ],
    });
    res.send({
      total: posts.count,
      // offset,
      // limit,
      posts: posts.rows,
    });
  } catch (error) {
    next(error);
  }
});

PostsRouter.get("/posts/single/:postId", async (req, res, next) => {
  try {
    const post = await PostModel.findByPk(req.params.postId);
    if (post) res.send(post);
    else
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
  } catch (error) {
    next(error);
  }
});

PostsRouter.put("/posts/single/:postId", async (req, res, next) => {
  try {
    const updatedPost = await PostModel.update(req.body, {
      where: { postId: req.params.postId },
      returning: true,
    });
    if (updatedPost) res.send(updatedPost);
    else
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
  } catch (error) {
    next(error);
  }
});

PostsRouter.delete("/posts/single/:postId", async (req, res, next) => {
  try {
    const deletedPost = await PostModel.destroy({
      where: { postId: req.params.postId },
    });

    if (deletedPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
PostsRouter.delete("/posts/all/:userId", async (req, res, next) => {
  try {
    const deletedPost = await PostModel.destroy({
      where: { userId: req.params.userId },
    });

    if (deletedPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// like dislike ✅ add liked post's id into user's liked posts property.
// PostsRouter.post("/posts/:postId/like", async (req, res, next) => {
//   try {
//     const post = await PostModel.findById(req.params.postId);
//     if (post) {
//       if (!post.likes.includes(req.body.userId)) {
//         const likedPost = await PostModel.findByIdAndUpdate(
//           req.params.postId,
//           { $push: { likes: req.body.userId } },
//           { new: true, runValidators: true }
//         );
//         await UsersModel.findByIdAndUpdate(
//           req.body.userId,
//           { $push: { likedPosts: req.params.postId } },
//           { new: true, runValidators: true }
//         );
//         res.send({
//           likesCount: likedPost.likes.length,
//           likes: likedPost.likes,
//           message: "Post liked!",
//         });
//       } else {
//         next(createHttpError(400, "You have already liked the post!"));
//       }
//     } else {
//       next(
//         createHttpError(404, `Post with od ${req.params.postId} not found!`)
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// PostsRouter.delete("/posts/:postId/dislike", async (req, res, next) => {
//   try {
//     const post = await PostModel.findById(req.params.postId);
//     if (post) {
//       if (post.likes.includes(req.body.userId)) {
//         const dislikedPost = await PostModel.findByIdAndUpdate(
//           req.params.postId,
//           { $pull: { likes: req.body.userId } },
//           { new: true, runValidators: true }
//         );
//         await UsersModel.findByIdAndUpdate(
//           req.body.userId,
//           { $pull: { likedPosts: req.params.postId } },
//           { new: true, runValidators: true }
//         );
//         res.send({
//           likesCount: dislikedPost.likes.length,
//           likes: dislikedPost.likes,
//           message: "Post disliked!",
//         });
//       } else {
//         next(createHttpError(400, "You have already disliked the post!"));
//       }
//     } else {
//       next(
//         createHttpError(404, `Post with id ${req.params.postId} not found!`)
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

export default PostsRouter;
