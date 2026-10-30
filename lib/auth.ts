
import { cookies } from "next/headers";
import { prisma } from "@/lip/prisma";

// ឈ្មោះ Cookie ដែល Browser រក្សាទុក
export const SESSION_COOKIE = "music_session";

// Session មានសុពលភាព 7 ថ្ងៃ
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export async function getCurrentUser() {
  // 1. យក Session Token ពី Cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  // 2. បើគ្មាន Token មានន័យថាមិនទាន់មាន Session
  if (!token) {
    return null;
  }

  // 3. ស្វែងរក Session ក្នុង Database
  const session = await prisma.session.findUnique({
    where: {
      sessionToken: token,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      },
    },
  });

  // 4. បើរក Session មិនឃើញ ឬ Session ផុតកំណត់
  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  // 5. បើ Session នៅមានសុពលភាព ត្រឡប់ User មកវិញ
  return session.user;
}
