'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// Get all users
export async function getUsers() {
    try {
        await dbConnect();
        const session = await auth();
        if (!session) throw new Error('Unauthorized');

        const users = await User.find({}).lean();

        // Custom sort: Admin > Staff > Customer, then by Join Date (Oldest first)
        const rolePriority = { 'admin': 1, 'staff': 2, 'customer': 3 };

        users.sort((a, b) => {
            const roleA = rolePriority[a.role.toLowerCase()] || 4;
            const roleB = rolePriority[b.role.toLowerCase()] || 4;

            if (roleA !== roleB) {
                return roleA - roleB;
            }

            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        return users.map(user => ({
            ...user,
            _id: user._id.toString(),
            createdAt: user.createdAt?.toISOString(),
            updatedAt: user.updatedAt?.toISOString(),
            joined: user.createdAt?.toISOString() || new Date().toISOString(), // Fallback
            status: user.isActive ? 'Active' : 'Inactive',
            avatar: user.avatar || `/users/${user.name.split(' ')[0].toLowerCase()}.jpg` // Use stored avatar or fallback
        }));
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw new Error('Failed to fetch users');
    }
}

// Create a new user
export async function createUser(userData) {
    try {
        await dbConnect();
        const session = await auth();

        // RBAC: Only Admin can create users
        if (!session || session.user.role?.toLowerCase() !== 'admin') {
            return { success: false, message: 'Unauthorized: Only Admins can create users' };
        }

        const { name, email, password, role, status, avatar } = userData;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { success: false, message: 'User with this email already exists' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: role.toLowerCase(),
            isActive: status === 'Active',
            avatar: avatar || null,
        });

        revalidatePath('/admin/users');
        return { success: true, message: 'User created successfully' };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, message: error.message };
    }
}

// Update a user
export async function updateUser(userId, userData) {
    try {
        await dbConnect();
        const session = await auth();

        // RBAC: Only Admin can update users
        if (!session || session.user.role?.toLowerCase() !== 'admin') {
            return { success: false, message: 'Unauthorized: Only Admins can update users' };
        }

        const { name, email, role, status, password, avatar } = userData;

        const updateData = {
            name,
            email,
            role: role.toLowerCase(),
            isActive: status === 'Active',
        };

        if (avatar) {
            updateData.avatar = avatar;
        }

        // Only update password if provided
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await User.findByIdAndUpdate(userId, updateData);

        revalidatePath('/admin/users');
        return { success: true, message: 'User updated successfully' };
    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, message: error.message };
    }
}

// Delete a user
export async function deleteUser(userId) {
    try {
        await dbConnect();
        const session = await auth();

        // RBAC: Only Admin can delete users
        if (!session || session.user.role?.toLowerCase() !== 'admin') {
            return { success: false, message: 'Unauthorized: Only Admins can delete users' };
        }

        // Prevent deleting yourself
        if (session.user.email === (await User.findById(userId))?.email) {
            return { success: false, message: 'You cannot delete your own account' };
        }

        await User.findByIdAndDelete(userId);

        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, message: error.message };
    }
}
