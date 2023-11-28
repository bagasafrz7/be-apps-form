import emailExist from "../library/emailExist.js";
import Users from "../models/Users.js";
import bcrypt from 'bcrypt';

class AuthController {
    async register(req, res) {
        const { fullname, email, password } = req.body;
        try {
            if(!fullname) { throw {code: 400, message: 'Fullname is Required!'} };
            if(!email) { throw {code: 400, message: 'Email is Required!'} };
            if(!password) { throw {code: 400, message: 'Password is Required!'} };
            if(password.length < 6) { throw {code: 400, message: 'Password must be at least 6 characters'} }; 
            
            const isEmailExist = await emailExist(email);
            console.log(isEmailExist)
            if(isEmailExist) { throw {code: 400, message: 'Email already exists'} }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const user = await Users.create({
                fullname,
                email,
                password: hash
            });

            if(!user) { throw {code: 500, message: 'User Register Failed'} }


            return res.status(200).json({status: true, message: 'User Register Success', data: user});
        } catch (err) {
            return res.status(err.code || 500).json({status: false, message: err.message});
        }
    }
}

export default new AuthController();