import bcrypt from "bcrypt";
import User from "../model/User.js";
import jwt  from "jsonwebtoken";

export const register = async (req, res, next) => {
    try {
        const  { 
            username,
            email, 
            password,
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = await User({
            username,
            email,
            password: passwordHash,
            picture: "",
        });

        const savedUser = await newUser.save();

        res.status(201).json({message: "User created successfully!"});
        
    } catch (error) {
        next(error) 
    }
}

export const loggedIn = async (req, res, next) => {
    try {
        const { email, password} = req.body;
        console.log(req.body);
        const user = await User.findOne({ email: email }).populate('friends', 'username picture lastMsg');
        if(!user) return res.status(400).json({msg: "User does not exist. "})

          console.log("User",user);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)

        if(!isMatch) res.status(401).json("Invaid Creadition");

        var token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
        const userObject = user.toObject();
        delete userObject.password;

        console.log("token",token);

        res.status(200).json({ token, user: userObject });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ msg: "Failed to Login", error: error.message });
    }
}

export const updateRegister = async (req, res, next) => {
    try {
      const { userId, username, email } = req.body;

      console.log(req.body);
      console.log("File", req.file);

      let picture = req.file ? `/assets/${req.file.filename}` : undefined;
  
      // Update user details using findByIdAndUpdate
      const updatedUser = await User.findByIdAndUpdate(
        userId, // Find the user by ID
        { 
          username, 
          email,
          picture 
        }, // Fields to update
        { new: true, } // Return the updated document and run validation
      );
  
      // Check if user exists
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with the updated user details
      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  
    } catch (error) {
      // Handle any errors
      next(error);
    }
  };
  