import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

const env = dotenv.config().parsed;

const jwtAuth = () => {
    return async (req, res, next) => {
        try {
            if(!req.headers.authorization) { throw { code: 400, message: 'Unauthorized!' }; }

            const token = req.headers.authorization.split(' ')[1] // Bearer <token>
            const verify = jsonwebtoken.verify(token, env.JWT_ACCESS_TOKEN_SECRET);
            req.jwt = verify;

            next()
        } catch (err) {
            const errorJWT = ['invalid signature', 'jwt malformed', 'jwt must be provided', 'invalid token']

            if(err.message == 'jwt expired') {
                err.message = 'Access Token Expired!'
            } else if (err.message == errorJWT.includes(err.message)) {
                err.message = 'Invalid Access Token!'
            }
            
            return res.status(err.code || 500).json({status: false, message: err.message});
        }
    }
}

export default jwtAuth;