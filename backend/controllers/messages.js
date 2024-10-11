import Messages from "../model/Messages.js";
import Group from "../model/Group.js";
import User from "../model/User.js";

export const addMessage = async (req, res, next) => {
  try {
    const { from, to, message, isGroup, GroupId } = req.body;

    // Convert `isGroup` to a boolean if it's passed as a string
    const isGroupBool = isGroup === 'true'; 

    const currentUser = await User.findById(from);
    const MsgingUser = !isGroupBool ? await User.findById(to) : null; // Only fetch `to` if it's not a group

    console.log(req.body);

    // Ensure both `from` and `to` users exist
    if (!currentUser) {
      return res.status(400).json({ msg: "Sender not found" });
    }
    if (!isGroupBool && !MsgingUser) {
      return res.status(400).json({ msg: "Recipient not found" });
    }

    let image = req.file ? `/assets/${req.file.filename}` : undefined;

    let data;
    if (isGroupBool) {
      // Check if the `to` is a valid group
      const group = await Group.findById(GroupId);
      if (!group) {
        return res.status(400).json({ msg: "Group not found" });
      }
      console.log("Group", group);
      // Create a group message
      data = await Messages.create({
        message: { text: message, image: image },
        users: group.members,  // Group members will be the users of the message
        sender: from,
        group: GroupId,  // Link this message to the group
      });
    } else {
      // Create a one-to-one message
      data = await Messages.create({
        message: { text: message, image: image },
        users: [from, to],  // Both users in the array
        sender: from,  // The person sending the message
      });

      // Update last message for both users
      await User.findByIdAndUpdate(currentUser._id, { lastMsg: message }, { new: true });
      await User.findByIdAndUpdate(MsgingUser._id, { lastMsg: message }, { new: true });

      // Add each other as friends if they are not already
      if (!currentUser.friends.includes(MsgingUser._id)) {
        currentUser.friends.push(MsgingUser._id);
        await currentUser.save();
      }
      if (!MsgingUser.friends.includes(currentUser._id)) {
        MsgingUser.friends.push(currentUser._id);
        await MsgingUser.save();
      }
    }

    if (data) {
      return res.status(201).json({ msg: "Message added successfully." });
    } else {
      return res.json({ msg: "Failed to add message to the database." });
    }
  } catch (error) {
    console.error("Error adding message:", error);
    next(error);
  }
};


export const getAllMessage = async (req, res, next) => {
  try {
    const { from, to, isGroup, groupId } = req.body;

    console.log(req.body);

    const iGroup = await Group.findById(groupId);
    const currentUser = await User.findById(from);

    console.log("Group", iGroup);

    let messages;
    if (isGroup) {
      // Fetch group messages
      messages = await Messages.find({
        group: groupId, // Filter by the group ID for group messages
      })
        .sort({ updatedAt: 1 })
        .populate('users', '_id username picture')
        .populate('group', '_id name picture')
        .populate('sender', '_id username picture');
    } else {
      // Fetch one-to-one messages
      messages = await Messages.find({
        users: { $all: [from, to] },
        group: { $exists: false }
      })
        .sort({ updatedAt: 1 })
        .populate('users', '_id username picture')
        .populate('sender', '_id username picture');
    }

    const projectMessages = messages.map((msg) => ({
      fromSelf: msg.sender._id.toString() === from,
      message: msg.message.text,
      sender: msg.sender,
      image: msg.message.image,
      sentAt: msg.sentAt,
      group: msg.group ? {
        id: msg.group._id,
        name: msg.group.name,
        picture: msg.group.picture
      } : null,
    }));

    return res.status(200).json(projectMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
    next(error);
  }
};

// export const getAllMessage = async (req, res) => {
//   try {
//       const { from, to, groupId, isGroup } = req.body; // Use 'groupId' instead of 'GroupId'

//       console.log("Body", req.body);

//       // Check if 'to' is a group ID by querying the Group model
//       const iGroup = await Group.findById(groupId);

//       console.log(isGroup);
//       let messages;

//       if (isGroup) {
//           // Fetch messages for the group
//           messages = await Messages.find({
//               users: { $in: iGroup.members }, // Get messages where any member of the group is involved
//               groupId: groupId // Ensure to filter by group ID
//           }).sort({ updatedAt: 1 });
//       } else {
//           // Fetch messages for a direct conversation
//           messages = await Messages.find({
//               users: { $all: [from, to] }, // Both users must be in the conversation
//           }).sort({ updatedAt: 1 });
//       }

//       const projectMessages = messages.map((msg) => ({
//           fromSelf: msg.sender.toString() === from,
//           message: msg.message.text,
//           image: msg.message.image,
//       }));

//       return res.status(200).json(projectMessages);
//   } catch (error) {
//       console.error("Error fetching messages:", error);
//       res.status(500).json({ msg: "Failed to get all messages" });
//   }
// };

export const createGroup = async (req, res) => {
  try {
    const { name, members, createdBy, picture } = req.body;

    const users = await User.find({ _id: { $in: members } });

    // Create new group
    const group = new Group({
      name,
      members,
      createdBy,
      picture: picture || "",
    });

    await group.save();


    await Promise.all(
      users.map(async (user) => {
        user.friends.push(group._id); // Assuming you want to push the group ID into the friends array
        await user.save(); // Save the updated user
      })
    );

    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all groups where the current user is a member
    const groups = await Group.find({ members: userId })
      .populate('members', 'username picture') // Populate group members' usernames and pictures
      .select('name picture'); // Select only the necessary fields

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

