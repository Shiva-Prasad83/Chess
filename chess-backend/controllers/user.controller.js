const { Game } = require("../models/game.model");
const User = require("../models/user.model");

const getUser = async (req, res) => {
    try {
        const { name } = req.params;
        //console.log(name);
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const recentMatches = async (req, res) => {
    try {
        const { userId } = req.params;
        const matches = await Game.find({
            $or: [
                {
                    whiteId: userId
                },
                {
                    blackId: userId
                }
            ]
        }).populate("whiteId", "name").populate("blackId", "name");
        ;

        //console.log(matches);
        matches.sort((a, b) => b.createdAt - a.createdAt);
        return res.status(200).json({ matches });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const findUsers = async (req, res) => {
    try {
        const { name } = req.query;
        console.log(name);
        if (name === req.user.name) {
            return res.status(400).json({ message: "Search For Friends" });
        }
        let userFromDB = await User.findOne({ name });
        if (!userFromDB) {
            return res.status(401).json({ message: 'User not found' });
        }

        //If friend request already sent ro already a friend.
        let already = userFromDB.friendRequests.some((fr) => fr.name === req.user.name);
        let alreadyFriend = userFromDB.friends.some((f) => f.name === req.user.name);
        let user;
        if (already || alreadyFriend) {
            user = {
                name: userFromDB.name,
                _id: userFromDB._id,
                already: true,
                message: already ? "Request Sent" : "Your Friend"
            }
        } else {

            user = {
                name: userFromDB.name,
                _id: userFromDB._id,
                already: false,
                message: ""
            }
        }

        console.log(user);

        return res.status(200).json(user);
    } catch (err) {
        // console.log(err);
        return res.status(500).json({ message: err.message });
    }
}


const sendFriendRequest = async (req, res) => {
    try {
        const { friendId, name } = req.body;
        console.log(friendId, 'sending friend request');
        const friend = await User.findById(friendId);
        console.log(friend, "friend");
        if (!friend) {
            return res.status(404).json({ message: "User not found" });
        }
        friend.friendRequests.push({ userId: req.user._id, name: req.user.name });
        await friend.save();
        return res.status(201).json({ message: "Request Sent" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


const getMyFriends = async (req, res) => {
    try {

    } catch (err) {
        console.log(err);
    }
}

const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ friendRequests: user.friendRequests });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const acceptFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.params;
        const friend = await User.findById(friendId);
        const me = await User.findById(req.user._id);
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }
        if (!me) {
            return res.status(404).json({ message: 'You are not found' });
        }
        me.friends.push({
            userId: friend._id,
            name: friend.name
        })
        friend.friends.push({
            userId: me._id,
            name: me.name
        })
        me.friendRequests = me.friendRequests.filter((fr) => fr.userId.toString() !== friend._id.toString());
        console.log(me.friendRequests);
        await me.save();
        await friend.save();
        return res.status(200).json({ friendRequest: me.friendRequest, message: "Friend Added" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const rejectFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.params;
        const me = await User.findById(req.user._id);
        if (!me) {
            return res.status(404).json({ message: "You are not found" });
        }
        me.friendRequests = me.friendRequests.filter((fr) => fr.userId.toString() !== friendId);
        await me.save();
        return res.status(200).json({ friendRequests: me.friendRequests, message: "Rejected" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = { getUser, recentMatches, findUsers, sendFriendRequest, getMyFriends, getFriendRequests, acceptFriendRequest, rejectFriendRequest };