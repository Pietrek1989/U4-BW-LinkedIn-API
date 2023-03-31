import Express from "express";
import createHttpError from "http-errors";
import ExperienceModel from "./model.js";
import UserModel from "../users/model.js";
import { Op } from "sequelize";

const ExperiencesRouter = Express.Router();

// export const isUserExisted = async (req, res, next) => {
//   const exists = await UserModel.findOne({
//     where: { userId: req.body.userId },
//   });
//   if (exists) next();
//   else
//     next(createHttpError(404, `User with id ${req.params.userId} not found!`));
// };

// create experience, post in into dedicated collection ✅, push it's object id into related user! ✅
ExperiencesRouter.post("/experiences/:userId", async (req, res, next) => {
  try {
    // const Experience = await ExperienceModel.create(req.body), {
    //   include: {
    //     model: UserModel,
    //     where {userId: req.params.userId}
    //   }
    // }
    const experience = await ExperienceModel.create({
      ...req.body,
      userId: req.params.userId, // set the foreign key to the user's ID
    });
    const user = await UserModel.findByPk(req.params.userId);
    if (user) {
      await user.addExperience(experience);
    }

    res.status(201).send(experience);
  } catch (error) {
    next(error);
  }
});

ExperiencesRouter.get("/experiences", async (req, res, next) => {
  try {
    // const limit = req.query.limit || 10;
    // const offset = req.query.offset || 0;
    const experiences = await ExperienceModel.findAndCountAll({
      // where: { ...query },
      order: [["userId", "ASC"]],
      // limit,
      // offset,
      // attributes: ["firstName", "lastName"],
    });
    res.send({
      total: experiences.count,
      // offset,
      // limit,
      experiences: experiences.rows,
    });
  } catch (error) {
    next(error);
  }
});

ExperiencesRouter.get("/experiences/:userId", async (req, res, next) => {
  try {
    // const limit = req.query.limit || 10;
    // const offset = req.query.offset || 0;
    const experiences = await ExperienceModel.findAndCountAll({
      where: { userId: req.params.userId },
      order: [["endDate", "ASC"]],
      // limit,
      // offset,
      // attributes: ["firstName", "lastName"],
    });
    res.send({
      total: experiences.count,
      // offset,
      // limit,
      experiences: experiences.rows,
    });
  } catch (error) {
    next(error);
  }
});

ExperiencesRouter.get("/experiences/single/:expId", async (req, res, next) => {
  try {
    const experience = await ExperienceModel.findByPk(req.params.expId);
    if (experience) res.send(experience);
    else
      next(
        createHttpError(
          404,
          `Experience with id ${req.params.expId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

ExperiencesRouter.put("/experiences/single/:expId", async (req, res, next) => {
  try {
    const updatedExperience = await ExperienceModel.update(req.body, {
      where: { experienceId: req.params.expId },
      returning: true,
    });
    if (updatedExperience) res.send(updatedExperience);
    else
      next(
        createHttpError(
          404,
          `Experience with id ${req.params.expId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

// delete experience from the dedicated collection ✅, and remove its object Id from related user's experiences array ✅
ExperiencesRouter.delete(
  "/experiences/single/:expId",
  async (req, res, next) => {
    try {
      const deletedExperience = await ExperienceModel.destroy({
        where: { experienceId: req.params.expId },
      });

      if (deletedExperience) {
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Experience with id ${req.params.expId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default ExperiencesRouter;
