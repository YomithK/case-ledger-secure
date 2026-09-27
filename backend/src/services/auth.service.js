import jwt from 'jsonwebtoken';
import * as userRepository from '../repository/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { jwt as jwtConfig } from '../config/index.js';

// Roles a user may choose for themselves at public registration
const SELF_REGISTER_ROLES = ['NGO', 'VICTIM'];

/**
 * Register a new user
 */
export const register = async (userData) => {
    const { name, email, password, role, phoneNumber, organizationName, nic, dob } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        const error = new Error('Email already registered');
        error.statusCode = 400;
        throw error;
    }

    //Check for duplicate NIC if provided
    if (nic) {
        const existingNIC = await userRepository.findByNIC(nic);
        if (existingNIC) {
            const error = new Error('NIC already registered');
            error.statusCode = 400;
            throw error;
        }
    }

    //Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
        // Never trust a client-supplied privileged role; fall back to the safe default
        role: SELF_REGISTER_ROLES.includes(role) ? role : 'NGO',
        phoneNumber,
        organizationName,
        nic,
        dob,
    });

    // Generate JWT token (exclude sensitive data: NIC or DOB)
    const token = generateToken(user);

    // Return user without password (NIC will be masked automatically by toJSON)
    const userObject = user.toJSON();

    return { user: userObject, token };
};

/**
 * Login user
 */
export const login = async (email, password) => {
    // Find user with password field
    const user = await userRepository.findByEmail(email, { includePassword: true });

    // Validate user exists
    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Check if user is active (generic message to avoid account enumeration)
    if (!user.isActive) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Update last login timestamp
    await userRepository.updateLastLogin(user._id);
    user.lastLoginAt = new Date(); // Update local object for response

    // Generate JWT token (exclude sensitive data: NIC or DOB)
    const token = generateToken(user);

    // Return user without password (NIC will be masked automatically by toJSON)
    const userObject = user.toJSON();

    return { user: userObject, token };
};

/**
 * Helper function to generate JWT token
 * @private
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
            email: user.email,
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
    );
};
