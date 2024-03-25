import dotenv from "dotenv";
import emailExist from "../library/emailExist.js";
import Users from "../models/Users.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const env = dotenv.config().parsed;

const generateAccessToken = async (payload) => {
 return jsonwebtoken.sign({ payload }, env.JWT_ACCESS_TOKEN_SECRET, {
  expiresIn: env.JWT_ACCESS_TOKEN_EXPIRED_TIME,
 });
};
const generateRefreshToken = async (payload) => {
 return jsonwebtoken.sign({ payload }, env.JWT_ACCESS_REFRESH_TOKEN_SECRET, {
  expiresIn: env.JWT_ACCESS_REFRESH_TOKEN_EXPIRED_TIME,
 });
};

class AuthController {
 async register(req, res) {
  const { fullname, email, password } = req.body;
  try {
   if (!fullname) {
    throw { code: 400, message: "Fullname is Required!" };
   }
   if (!email) {
    throw { code: 400, message: "Email is Required!" };
   }
   if (!password) {
    throw { code: 400, message: "Password is Required!" };
   }
   if (password.length < 6) {
    throw { code: 400, message: "Password must be at least 6 characters" };
   }

   const isEmailExist = await emailExist(email);
   if (isEmailExist) {
    throw { code: 400, message: "Email already exists" };
   }

   const salt = await bcrypt.genSalt(10);
   const hash = await bcrypt.hash(password, salt);

   const user = await Users.create({
    fullname,
    email,
    password: hash,
   });

   if (!user) {
    throw { code: 500, message: "User Register Failed" };
   }

   return res
    .status(200)
    .json({ status: true, message: "User Register Success", data: user });
  } catch (err) {
   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }

 async login(req, res) {
  const { email, password } = req.body;
  try {
   if (!email) {
    throw { code: 400, message: "Email is Required!" };
   }
   if (!password) {
    throw { code: 400, message: "Password is Required!" };
   }

   const user = await Users.findOne({ email });
   if (!user) {
    throw { code: 400, message: "User Not Found" };
   }

   const isPasswordValid = await bcrypt.compareSync(password, user.password);
   if (!password) {
    throw { code: 400, message: "Invalid Password" };
   }

   const accessToken = await generateAccessToken({ id: user._id });
   const refreshToken = await generateRefreshToken({ id: user._id });

   return res
    .status(200)
    .json({
     status: true,
     message: "Login Success",
     accessToken,
     refreshToken,
     data: { fullname: user.fullname },
    });
  } catch (err) {
   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }

 async refreshToken(req, res) {
  try {
   if (!req.body.refreshToken) {
    throw { code: 400, message: "Refresh token required!" };
   }

   const verifyToken = await jsonwebtoken.verify(
    req.body.refreshToken,
    env.JWT_ACCESS_REFRESH_TOKEN_SECRET
   );

   let payload = { id: verifyToken.id };
   const accessToken = await generateAccessToken(payload);
   const refreshToken = await generateRefreshToken(payload);

   return res
    .status(200)
    .json({
     status: true,
     message: "Refresh Token Success",
     accessToken,
     refreshToken,
    });
  } catch (err) {
   const errorJWT = [
    "invalid signature",
    "jwt malformed",
    "jwt must be provided",
    "invalid token",
   ];

   if (err.message == "jwt expired") {
    err.message = "Refresh Token Expired!";
   } else if (err.message == errorJWT.includes(err.message)) {
    err.message = "Invalid Refresh Token!";
   }

   return res
    .status(err.code || 500)
    .json({ status: false, message: err.message });
  }
 }
}

export default new AuthController();
