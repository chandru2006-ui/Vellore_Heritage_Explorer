const User = require("../models/User");


// ============================================================
// GET ALL USERS
// ============================================================

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {

        console.error(
            "Get admin users error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


// ============================================================
// SEARCH USERS
// ============================================================

const searchUsers = async (req, res) => {
    try {
        const search =
            typeof req.query.q === "string"
                ? req.query.q.trim()
                : "";

        if (!search) {
            return getAllUsers(req, res);
        }

        const regex =
            new RegExp(search, "i");

        const users =
            await User.find({
                $or: [
                    {
                        name: regex
                    },
                    {
                        email: regex
                    }
                ]
            })
            .select("-password")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {

        console.error(
            "Search admin users error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to search users"
        });
    }
};


// ============================================================
// UPDATE USER ROLE
// ============================================================

const updateUserRole = async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        const {
            role
        } = req.body;


        // --------------------------------------------------------
        // Validate role
        // --------------------------------------------------------

        if (
            !["user", "admin"].includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Role must be either user or admin"
            });
        }


        // --------------------------------------------------------
        // Find user
        // --------------------------------------------------------

        const user =
            await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        // --------------------------------------------------------
        // Protect currently logged-in admin
        // --------------------------------------------------------
        //
        // An administrator must not be able to
        // accidentally remove their own admin role.
        //

        if (
            req.user &&
            req.user.userId &&
            req.user.userId.toString() ===
                user._id.toString()
        ) {
            if (role !== "admin") {
                return res.status(400).json({
                    success: false,
                    message:
                        "You cannot remove your own admin role."
                });
            }
        }


        // --------------------------------------------------------
        // Update role
        // --------------------------------------------------------

        user.role = role;

        await user.save();


        // --------------------------------------------------------
        // Return safe user data
        // --------------------------------------------------------

        const updatedUser =
            await User.findById(
                user._id
            ).select("-password");


        return res.status(200).json({
            success: true,
            message:
                `User role updated to ${role} successfully`,
            data: updatedUser
        });

    } catch (error) {

        console.error(
            "Update user role error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update user role"
        });
    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getAllUsers,
    searchUsers,
    updateUserRole
};