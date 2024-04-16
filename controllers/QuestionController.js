import mongoose from "mongoose";
import Form from "../models/Form.js";

const allowedTypes = ["Text", "Email", "Radio", "Checkbox", "Dropdown"];

class QuestionController {
  async index(req, res) {
    try {
      if (!req.params.id) {
        throw { code: 428, message: "ID_REQUIRED" };
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw { code: 400, message: "INVALID_ID" };
      }

      const question = await Form.findOne({ _id: req.params.id, userId: req.jwt.payload.id})
      if (!question) {
        throw { code: 404, message: "ADD_QUESTION_NOT_FOUND" };
      }

      res.status(200).json({
        status: true,
        message: "GET_LIST_QUESTION_SUCCESS",
        form: question,
      });
    } catch (err) {
      res.status(err.code || 500).json({
        status: false,
        message: err.message,
      });
    }
  }

  async store(req, res) {
    try {
      //check form id
      if (!req.params.id) {
        throw { code: 428, message: "ID_REQUIRED" };
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw { code: 400, message: "INVALID_ID" };
      }

      //input field
      let newQuestion = {
        id: new mongoose.Types.ObjectId(),
        type: "Text",
        question: null,
        options: [],
        required: false,
      };

      //update form
      const question = await Form.findOneAndUpdate(
        { _id: req.params.id, userId: req.jwt.payload.id },
        { $push: { questions: newQuestion } },
        { new: true }
      );

      if (!question) {
        throw { code: 500, message: "ADD_QUESTION_FAILED" };
      }

      res.status(200).json({
        status: true,
        message: "ADD_QUESTION_SUCCESS",
        question: newQuestion,
      });
    } catch (err) {
      res.status(err.code || 500).json({
        status: false,
        message: err.message,
      });
    }
  }

  async update(req, res) {
    try {
      if (!req.params.id) {
        throw { code: 400, message: "REQUEST_ID" };
      }
      if (!req.params.questionId) {
        throw { code: 400, message: "REQUEST_QUESTION_ID" };
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw { code: 400, message: "INVALID_ID" };
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
        throw { code: 400, message: "INVALID_ID" };
      }

      let field = {};
      if (req.body.hasOwnProperty("question")) {
        field["questions.$[indexQuestion].question"] = req.body.question;
      } else if (req.body.hasOwnProperty("required")) {
        field["questions.$[indexQuestion].required"] = req.body.required;
      } else if (req.body.hasOwnProperty("type")) {
        if (!allowedTypes.includes(req.body.type)) {
          throw { code: 400, message: "INVALID_TYPE" };
        }
        field["questions.$[indexQuestion].type"] = req.body.type;
      }

      //update form
      const question = await Form.findOneAndUpdate(
        { _id: req.params.id, userId: req.jwt.payload.id },
        { $set: field },
        {
          arrayFilters: [
            { "indexQuestion.id": new mongoose.Types.ObjectId(req.params.questionId) },
          ],
          new: true,
        }
      );

      console.log(question)

      if (!question) {
        throw { code: 400, message: "QUESTION_UPDATE_FAILED" };
      }

      return res
        .status(200)
        .json({ status: true, message: "QUESTION_UPDATE_SUCCESS", data: question });
    } catch (err) {
      return res
        .status(err.code || 500)
        .json({ status: false, message: err.message });
    }
  }

  async destroy(req, res) {
    try {
      if (!req.params.id) {
        throw { code: 400, message: "REQUEST_ID" };
      }
      if (!req.params.questionId) {
        throw { code: 400, message: "REQUEST_QUESTION_ID" };
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw { code: 400, message: "INVALID_ID" };
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
        throw { code: 400, message: "INVALID_ID" };
      }

      //update form
      const question = await Form.findOneAndUpdate(
        { _id: req.params.id, userId: req.jwt.payload.id },
        { $pull: { questions: { id: new mongoose.Types.ObjectId(req.params.questionId)} } },
        { new: true }
      );

      if (!question) {
        throw { code: 500, message: "DELETE_QUESTION_FAILED" };
      }

      res.status(200).json({
        status: true,
        message: "DELETE_QUESTION_SUCCESS",
        question: question,
      });
    } catch (err) {
      res.status(err.code || 500).json({
        status: false,
        message: err.message,
      });
    }
  }
}

export default new QuestionController();
