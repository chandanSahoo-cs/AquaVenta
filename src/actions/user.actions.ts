"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import bcrypt from "bcrypt";
import { addDays } from "date-fns";
import jwt, { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { Prisma } from "../../generated/prisma";

interface TokenPayload {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface RegisterDetails {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

interface LoginDetails {
  email?: string;
  phone?: string;
  password: string;
}

async function hashPassword(password: string): Promise<string> {
  const hashPassword = await bcrypt.hash(password, 10);
  return hashPassword;
}

async function dehashPassword(
  userPassword: string,
  encryptedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(userPassword, encryptedPassword);
}

function generateAccessToken({ id, name, email, role }: TokenPayload): string {
  return jwt.sign(
    {
      id,
      name,
      email,
      role,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
  );
}

function generateRefreshToken({ id }: TokenPayload): string {
  return jwt.sign(
    {
      id,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
  );
}

async function generateAccessAndRefreshToken(id: string) {
  try {
    if (!id) {
      throw new Error("Invalid id");
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        refreshTokens: true,
      },
    });

    if (!user) {
      throw new Error("Failed to find user");
    }

    const userName = user.name;
    const userEmail = user.email;

    if (!userName && !userEmail) {
      throw new Error("Invalid user credentials");
    }

    const refreshToken = generateRefreshToken({ id });
    const accessToken = generateAccessToken({
      id,
      name: userName as string,
      email: userEmail as string,
      role: user.role,
    });

    if (!refreshToken || !accessToken) {
      throw new Error("Failed to generate refresh or access token");
    }

    const userRefreshToken = await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(
          new Date(),
          parseInt(process.env.REFRESH_TOKEN_EXPIRY!.slice(0, 2)) || 30
        ),
      },
    });

    if (!userRefreshToken) {
      throw new Error("Failed to enter refresh token");
    }

    return { success: true, data: { accessToken, refreshToken } };
  } catch (error) {
    return {
      success: false,
      data: {
        error: (error as Error).message,
      },
    };
  }
}

const giveUserPayload = async () => {
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value;

  const { id, name, email, role } = jwt.verify(
    accessToken!,
    process.env.ACCESS_TOKEN_SECRET!
  ) as jwt.JwtPayload;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  const userPresent = user !== null;

  return { id, name, email, role, userPresent };
};

// user actions

const registerUser = async ({
  name,
  email,
  phone,
  password,
}: RegisterDetails) => {
  try {
    if (!name || !email || !phone || !password) {
      throw new Error("Invalid credentials");
    }

    const passwordHash = await hashPassword(password);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new Error("User with same email or phone number exits");
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "citizen",
      },
    });

    const loginResult = await loginUser({ email, phone, password });
    if (!loginResult.success) {
      throw new Error("Login after registration failed");
    }

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error(`Failed to register user :: ${error}`);
    return { success: false, data: { error: (error as Error).message } };
  }
};

const loginUser = async ({ email, phone, password }: LoginDetails) => {
  try {
    if (!email || !phone) {
      throw new Error("Invalid credentials");
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (!existingUser) {
      throw new Error("User does not exists");
    }

    const isPasswordValid = await dehashPassword(
      password,
      existingUser.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid Password");
    }

    const tokens = await generateAccessAndRefreshToken(existingUser.id);

    if (!tokens.success) {
      throw new Error("Failed to generate tokens");
    }
    const { refreshToken, accessToken } = tokens.data;

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const cookie = await cookies();

    cookie.set("accessToken", accessToken!, options);
    cookie.set("refreshToken", refreshToken!, options);

    const { passwordHash, ...userData } = existingUser;

    return {
      success: true,
      data: {
        user: userData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: {
        error: (error as Error).message,
      },
    };
  }
};

const logoutUser = async () => {
  try {
    const cookie = await cookies();
    const accessToken = cookie.get("accessToken")?.value;
    const refreshToken = cookie.get("refreshToken")?.value;

    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as jwt.JwtPayload;
    const userId = payload.id;

    if (!userId) {
      throw new Error("User Id not found");
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, revoked: false },
        data: { revoked: true },
      });
    }

    cookie.set("accessToken", "", { path: "/", maxAge: 0 });
    cookie.set("refreshToken", "", { path: "/", maxAge: 0 });

    return { success: true, data: {} };
    // redirect
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: {
        error: (error as Error).message,
      },
    };
  }
};

// Get user report by verdict

export type ReportWithLatestValidation = Prisma.ReportGetPayload<{
  include: {
    user: true;
    validations: {
      orderBy: { validatedAt: "desc" };
      take: 1;
    };
  };
}>;

export interface UserReportResponse {
  success: boolean;
  userReport: ReportWithLatestValidation[];
}

const getUserReportByVerdict = async (): Promise<UserReportResponse> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("User not found");
    }

    const userReport = await prisma.report.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        user: true,
        validations: {
          orderBy: {
            validatedAt: "desc",
          },
          take: 1,
        },
      },
    });

    return { success: true, userReport };
  } catch (error) {
    console.error("Getting user report error: ", error);
    return { success: false, userReport: [] };
  }
};

const banUser = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: false,
      },
    });

    return { success: true, updatedUser };
  } catch (error) {
    console.error(error);
    return { success: false, updatedUser: {} };
  }
};

export interface UserWithReportStats {
  id: string;
  name: string | null;
  email: string | null;
  acceptedCount: number;
  rejectedCount: number;
}

// Query function
const getUsersWithReportStats = async (): Promise<UserWithReportStats[]> => {
  const users = await prisma.user.findMany({
    include: {
      reports: {
        select: { status: true },
      },
    },
  });

  return users.map((user) => {
    const acceptedCount = user.reports.filter(
      (r) => r.status === "verified"
    ).length;
    const rejectedCount = user.reports.filter(
      (r) => r.status === "rejected"
    ).length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      acceptedCount,
      rejectedCount,
    };
  });
};

export {
  banUser,
  dehashPassword,
  generateAccessToken,
  getUserReportByVerdict,
  getUsersWithReportStats,
  giveUserPayload,
  hashPassword,
  loginUser,
  logoutUser,
  registerUser,
};
