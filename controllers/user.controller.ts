import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, users, subscriptions } from '../database/index.js';
import { AuthRequest, AppError } from '../types/index.js';

// GET all users (admin only in production, useful for dev)
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        password: false,
      },
    });
    res.status(200).json({ success: true, data: allUsers });
  } catch (error) {
    next(error);
  }
};

// GET user by ID
export const getUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
      columns: {
        password: false,
      },
    });

    if (!user) {
      const error = new Error('User not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// GET current logged-in user profile
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
      columns: {
        password: false,
      },
    });

    if (!user) {
      const error = new Error('User not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// UPDATE user
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Users can only update their own profile
    if (req.user!.id !== req.params.id) {
      const error = new Error('Not authorized to update this user') as AppError;
      error.statusCode = 403;
      throw error;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
    });

    if (!user) {
      const error = new Error('User not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Fields that can be updated
    const { name, email, password } = req.body;
    const updateData: Partial<{ name: string; email: string; password: string; updatedAt: Date }> = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();

    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, req.params.id))
      .returning();

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

// DELETE user
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Users can only delete their own account
    if (req.user!.id !== req.params.id) {
      const error = new Error('Not authorized to delete this user') as AppError;
      error.statusCode = 403;
      throw error;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
    });

    if (!user) {
      const error = new Error('User not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    // Delete all user's subscriptions first (handled by cascade, but explicit for clarity)
    await db.delete(subscriptions).where(eq(subscriptions.userId, req.params.id));

    // Delete the user
    await db.delete(users).where(eq(users.id, req.params.id));

    res.status(200).json({ success: true, message: 'User and all associated subscriptions deleted successfully' });
  } catch (error) {
    next(error);
  }
};
