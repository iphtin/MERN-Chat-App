import User from "../model/User.js";
import Messages from "../model/Messages.js";
import Group from "../model/Group.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('friends', 'username name picture lastMsg updatedAt');
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ Message: error.message })
  }
}

export const getAllUser = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        next(error)
    }
}

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, profile } = req.body;
    const updateUser = await User.findByIdAndUpdate(id, {
       username,
       email,
       profile
    } , { new: true});
    res.status(201).json({message: "User Updated Successfully!"});
  } catch (error) {
    next(error)
  }
}

// export const getUserContacts = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const chatUsers = await Chat.aggregate([
//       {
//         $match: {
//           $or: [{ senderId: mongoose.Types.ObjectId(userId) }, { receiverId: mongoose.Types.ObjectId(userId) }]
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           contacts: { $addToSet: { $cond: [{ $eq: ["$senderId", mongoose.Types.ObjectId(userId)] }, "$receiverId", "$senderId"] } }
//         }
//       },
//       {
//         $unwind: "$contacts" 
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "contacts",
//           foreignField: "_id",
//           as: "contactDetails"
//         }
//       },
//       {
//         $unwind: "$contactDetails"
//       },
//       {
//         $project: {
//           _id: 0,
//           "contactDetails._id": 1,
//           "contactDetails.username": 1,
//           "contactDetails.profile": 1
//         }
//       }
//     ]);

//     res.json(chatUsers.map(c => c.contactDetails));
//   } catch (error) {
//     next(error);
//   }
// };


export const getUserContacts = async (req, res) => {
  try {
    const { id } = req.params; // User ID from params

    // Find all one-to-one messages where the user is either the sender or part of the users array (ignore group messages)
    const messages = await Messages.find({
      $and: [
        { group: { $exists: false } }, // Ensure it's not a group message
        {
          $or: [
            { sender: id },  // Messages sent by the user
            { users: id }    // Messages where the user is part of the conversation
          ]
        }
      ]
    })
    .select('sender users sentAt message') // Fetch sender, users, sentAt, and message content
    .populate('sender', 'username picture') // Populate sender's username and picture
    .populate('users', 'username picture'); // Populate users' username and picture

    // Create a map to track the most recent message for each unique user (contacts only)
    const contactMap = new Map();

    // Process each message to find unique contacts and the latest message
    messages.forEach(message => {
      message.users.forEach(user => {
        if (user._id.toString() !== id) {
          const existingContact = contactMap.get(user._id.toString());
          if (!existingContact || existingContact.lastMessageTime < message.sentAt) {
            contactMap.set(user._id.toString(), {
              _id: user._id,
              username: user.username,
              picture: user.picture,
              type: 'contact',
              lastMessageTime: message.sentAt,
              lastMessageContent: message.message.text
            });
          }
        }
      });

      if (message.sender._id.toString() !== id) {
        const existingContact = contactMap.get(message.sender._id.toString());
        if (!existingContact || existingContact.lastMessageTime < message.sentAt) {
          contactMap.set(message.sender._id.toString(), {
            _id: message.sender._id,
            username: message.sender.username,
            picture: message.sender.picture,
            type: 'contact',
            lastMessageTime: message.sentAt,
            lastMessageContent: message.message.text
          });
        }
      }
    });

    // Fetch groups where the current user is a member
    const groups = await Group.find({ members: id })
      .select('name picture members') // Only return necessary fields like name and picture
      .populate('members', 'username picture'); 

    // Fetch the last message for each group the user is a part of
    const groupMessages = await Messages.find({
      group: { $in: groups.map(group => group._id) }  // Only fetch messages for groups the user is in
    })
    .sort({ sentAt: -1 }) // Sort messages by most recent
    .populate('group', 'name picture') // Populate group details
    .populate('sender', 'username picture') // Populate sender details
    .limit(1); // Get the most recent message for each group

    // Map the groups and their latest message
    const groupData = groups.map(group => {
      const lastMessage = groupMessages.find(msg => msg.group._id.toString() === group._id.toString());
      return {
        _id: group._id,
        name: group.name,
        picture: group.picture,
        members: group.members,
        lastMessageTime: lastMessage ? lastMessage.sentAt : null,
        lastMessageContent: lastMessage ? lastMessage.message.text : "No messages yet", 
        type: 'group'
      };
    });

    // Convert the contactMap to an array and sort by lastMessageTime (descending)
    const sortedContacts = [...contactMap.values()]
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    // Combine contacts and groups into a single array and sort by lastMessageTime (descending)
    const combinedData = [...sortedContacts, ...groupData]
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    // Return the combined contacts and groups
    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching contacts and groups:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

