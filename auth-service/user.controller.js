const UserModel = require("./user.model");
const jwt = require('jsonwebtoken')
const register = async (req, res) => {
  const { email, password, name } = req.body;
  const userExist = await UserModel.findOne({ email: email });
  if (userExist) {
    return res.json({ message: "User already exists" });
  }

  const newUser = new UserModel({
    name: name,
    email: email,
    password: password,
  });
  newUser.save();

  return res.json(newUser);
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email});
    if(!user){
        return res.json({ message: "User not found" });
    }

    if(password !== user.password){
        return res.json({ message: "Password incorrect" });
    }
   jwt.sign({email,_id:user._id},"secret",(err,token)=>{
    if(err) console.log(err);
    else{
        return res.json({ token:token });
    }
   })

};
module.exports = { register, login };
