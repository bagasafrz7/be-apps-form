import mongoose from "mongoose";
import Form from "../models/Form.js";

class FormController {
 async index(req, res) {
  try {
   const limit = parseInt(req.query.limit) || 10;
   const page = parseInt(req.query.page) || 1;

   const form = await Form.paginate(
    {
     userId: req.jwt.payload.id,
    },
    {
     limit: limit,
     page: page,
    }
   );

   if (!form) {
    throw { code: 404, message: "NOT_FOUND" };
   }

   return res.status(200).json({
    status: true,
    message: "LIST_FORMS_SUCCESS",
    data: form,
    total: form.length,
   });
  } catch (err) {
   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }

 async store(req, res) {
  try {
   const form = await Form.create({
    userId: req.jwt.payload.id,
    title: "Untitled Form",
    description: null,
    public: true,
   });

   if (!form) {
    throw { code: 500, message: "FAILED_CREATE_FORM" };
   }

   return res
    .status(200)
    .json({ status: true, message: "SUCCESS_CREATE_FORM", form });
  } catch (err) {
   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }

 async show(req, res) {
  try {
   if (!req.params.id) {
    throw { code: 400, message: "ID_REQUIRED" };
   }
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw { code: 400, message: "INVALID_ID" };
   }

   const form = await Form.findOne({
    _id: req.params.id,
    userId: req.jwt.payload.id,
   });

   if (!form) {
    throw { code: 404, message: "NOT_FOUND" };
   }

   return res
    .status(200)
    .json({ status: true, message: "SUCCESS", data: form });
  } catch (err) {
   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }

 async update(req, res) {
  try {
   if (!req.params.id) {
    throw { code: 400, message: "ID_REQUIRED" };
   }
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw { code: 400, message: "INVALID_ID" };
   }

   const form = await Form.findOneAndUpdate(
    {
     _id: req.params.id,
     userId: req.jwt.payload.id,
    },
    req.body,
    {
     new: true,
    }
   );

   if (!form) {
    throw { code: 404, message: "FORM_UPDATED_FAILED" };
   }

   return res.status(200).json({
    status: true,
    message: "FORM_UPDATED_SUCCESSFULLY",
    data: form,
   });
  } catch (error) {
   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }

 async destroy(req, res) {
  try {
   if (!req.params.id) {
    throw { code: 400, message: "ID_REQUIRED" };
   }
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw { code: 400, message: "INVALID_ID" };
   }

   const form = await Form.findOneAndDelete({
    _id: req.params.id,
    userId: req.jwt.payload.id,
   });

   if (!form) {
    throw { code: 404, message: "FORM_DELETE_FAILED" };
   }

   return res.status(200).json({
    status: true,
    message: "FORM_DELETE_SUCCESSFULLY",
    data: form,
   });
  } catch (error) {
   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }
}

export default new FormController();
