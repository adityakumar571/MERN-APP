const UserModel = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({
          massage: "User is already exist, you can login",
          sucess: false,
        });
    }

    const userModel = new UserModel({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res.status(201).json({
      message: "signup successfully",
      success: true,
    });
  } catch (err) {
    res.status(5000).json({
      message: "Internal server error",
      success: false,
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errMsg = "Auth failed or password is wrong";
    if (!user) {
      return res.status(403).json({ massage: errMsg, sucess: false });
    }

    const isPasEqual = await bcrypt.compare(password, user.password);
    if (!isPasEqual) {
      return res.status(403).json({ massage: errMsg, sucess: false });
    }


    
    const jwtToken = jwt.sign(
      {
        email: user.email,
        _id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(200).json({
      message: "login successfully",
      success: true,
      email,
      jwtToken,
      name: user.name,
    });
  } catch (err) {
    res.status(5000).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  signup,
  login,
};
