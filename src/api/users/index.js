import Express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import UserModel from "./model.js";
import ExperienceModel from "../experiences/model.js";
import PostModel from "../posts/model.js";
import { Op } from "sequelize";


const UsersRouter = Express.Router();

UsersRouter.post("/users", async (req, res, next) => {
  try {
    const exists = await UserModel.findOne({
      where: { email: req.body.email },
    });
    if (exists) {
      res.send(
        createHttpError(
          400,
          `User with email ${req.body.email} already exists!`
        )
      );
    } else {
      const Users = await UserModel.create(req.body);
      res.status(201).send(Users.userId);
    }
  } catch (err) {
    next(err);
  }
});

UsersRouter.get("/users", async (req, res, next) => {
  try {
    const query = {};

    if (req.query.search) {
      query[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { surname: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const limit = req.query.limit || 10;
    const offset = req.query.offset;

    const user = await UserModel.findAndCountAll({
      where: { ...query },
      order: [
        ["name", "ASC"],
        ["surname", "ASC"],
      ],
      limit,
      offset,
      include: [
        { model: ExperienceModel, attributes: ["role", "company", "endDate"] },
        { model: PostModel, attributes: ["text", "image"] },
      ],
    });
    const userCount = await UserModel.count({ where: query });
    const totalPages = Math.ceil(userCount / limit);
    const nextPageOffset = parseInt(offset) + parseInt(limit);
    const prevPageOffset = parseInt(offset) - parseInt(limit);
    const nextPageUrl =
      nextPageOffset < userCount
        ? `${req.baseUrl}?limit=${limit}&offset=${nextPageOffset}`
        : null;
    const prevPageUrl =
      prevPageOffset >= 0
        ? `${req.baseUrl}?limit=${limit}&offset=${prevPageOffset}`
        : null;

    res.send({
      total: userCount,
      limit,
      offset,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      users: user.rows,
    });
  } catch (err) {
    next(err);
  }
});

UsersRouter.get("/users/:userId", async (req, res, next) => {
  try {
    const user = await UserModel.findByPk(req.params.userId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        { model: ExperienceModel, attributes: ["role", "company", "endDate"] },
        { model: PostModel, attributes: ["text", "image"] },
        // to exclude from the results the junction table rows --> through: { attributes: [] }
      ],
    }); // attributes could be an array (when you want to pass a list of the selected fields), or an object (with the exclude property, whenever you want to pass a list of omitted fields)
    if (user) {
      res.send(user);
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (err) {
    next(err);
  }
});

UsersRouter.put("/users/:userId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await UserModel.update(
      req.body,
      { where: { userId: req.params.userId }, returning: true }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (err) {
    next(err);
  }
});

UsersRouter.delete("/users/:userId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await UserModel.destroy({
      where: { userId: req.params.userId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
});
UsersRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId, {
      include: {
        model: ExperienceModel,
        // where: { title: { [Op.iLike]: "%react%" } },
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

UsersRouter.get("/:userId/posts", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId, {
      include: {
        model: PostModel,
        // attributes: ["text"],
        // where: { title: { [Op.iLike]: "%react%" } },
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});
// UsersRouter.put(
//   "/users/:userId/friendRequest/:secondUserId",
//   async (req, res, next) => {
//     try {
//       const newSender = await UsersModel.findById(req.params.userId);
//       const newReciever = await UsersModel.findById(req.params.secondUserId);
//       if ((newSender, newReciever)) {
//         if (!newSender.friends.includes(req.params.secondUserId)) {
//           if (
//             !newReciever.friendRequests.includes(
//               req.params.userId.toString()
//             ) &&
//             !newSender.friendRequests.includes(req.params.userId.toString())
//           ) {
//             const reciever = await UsersModel.findByIdAndUpdate(
//               req.params.secondUserId,
//               { $push: { friendRequests: req.params.userId } },
//               { new: true, runValidators: true }
//             );
//             res.send({ reciever, message: "Friend Request Sent" });
//           } else {
//             const reciever = await UsersModel.findByIdAndUpdate(
//               req.params.secondUserId,
//               { $pull: { friendRequests: req.params.userId } },
//               { new: true, runValidators: true }
//             );
//             res.send(`Friend Request unsent`);
//           }
//         } else {
//           res.send("You are already friends with this user");
//         }
//       }
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// UsersRouter.put(
//   "/users/:userId/friendUnfriend/:secondUserId",
//   async (req, res, next) => {
//     try {
//       const newFriend = await UsersModel.findById(req.params.userId);
//       if (newFriend) {
//         if (!newFriend.friends.includes(req.params.secondUserId.toString())) {
//           const reciever = await UsersModel.findByIdAndUpdate(
//             req.params.userId,
//             {
//               $push: { friends: req.params.secondUserId },
//               $pull: { friendRequests: req.params.secondUserId },
//             },
//             { new: true, runValidators: true }
//           );

//           const sender = await UsersModel.findByIdAndUpdate(
//             req.params.secondUserId,
//             { $push: { friends: req.params.userId } },

//             { new: true, runValidators: true }
//           );
//           res.send("Friend request accepted");
//           if (
//             !newFriend.friendRequests.includes(
//               req.params.secondUserId.toString()
//             )
//           ) {
//             res.send("You need to send a friend request first");
//           }
//         } else {
//           const reciever = await UsersModel.findByIdAndUpdate(
//             req.params.userId,
//             { $pull: { friends: req.params.secondUserId } },

//             { new: true, runValidators: true }
//           );
//           const sender = await UsersModel.findByIdAndUpdate(
//             req.params.secondUserId,
//             { $pull: { friends: req.params.userId } },

//             { new: true, runValidators: true }
//           );
//           res.send("Unfriended");
//         }
//       }
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// UsersRouter.put;

// UsersRouter.put(
//   "/users/:userId/decline/:secondUserId",
//   async (req, res, next) => {
//     try {
//       const newFriend = await UsersModel.findById(req.params.userId);
//       if (newFriend) {
//         if (
//           newFriend.friendRequests.includes(req.params.secondUserId.toString())
//         ) {
//           const reciever = await UsersModel.findByIdAndUpdate(
//             req.params.userId,
//             { $pull: { friendRequests: req.params.secondUserId } },
//             { new: true, runValidators: true }
//           );
//           const sender = await UsersModel.findByIdAndUpdate(
//             req.params.secondUserId,
//             { $pull: { sentRequests: req.params.userId } },
//             { new: true, runValidators: true }
//           );
//           res.send("Friend Request Declined");
//         } else {
//           res.send("There is no request to decline");
//         }
//       }
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// UsersRouter.get("/users/:userId/friendReqs", async (req, res, next) => {
//   try {
//     const User = await UsersModel.findById(req.params.userId);

//     //  const allReqs=
//     User.populate({ path: "friendRequests", select: "name email image" }).then(
//       (user) => {
//         res.json(user);
//       }
//     );
//     // const freindReqs=User.friendRequests

//     // res.send(allReqs)
//   } catch (err) {
//     next(err);
//   }
// });

// UsersRouter.get("/users/:userId/friends", async (req, res, next) => {
//   try {
//     const User = await UsersModel.findById(req.params.userId);

//     //  const allReqs=
//     User.populate({ path: "friends", select: "name email image" }).then(
//       (user) => {
//         res.json(user);
//       }
//     );
//     // const freindReqs=User.friendRequests

//     // res.send(allReqs)
//   } catch (err) {
//     next(err);
//   }
// });
export default UsersRouter;
