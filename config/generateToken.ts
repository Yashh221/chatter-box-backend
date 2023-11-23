import jwt from 'jsonwebtoken'


const generateToken = (id : string) => {
    const key = process.env.JWT_SECRET_KEY;
    if (!key) {
        throw new Error("Invalid Secret Key.");
      }
    return jwt.sign({id},key,{
        expiresIn:"30d"
    })
}

export default generateToken;