import { dbreq, multipledbreq } from "./db";
import { getAuth } from "./dbreq";

export interface ClassProgram {
  id: number;
  name: string;
  room: string;
  class: string;
  time_slot: string;
  description?: string;
  created_at?: string;
}

export interface ClassProgramVote {
  id: number;
  email: string;
  program_id: number;
  vote_order: number;
  created_at: string;
}

export interface ProgramWithVotes extends ClassProgram {
  vote_count: number;
  user_vote_order?: number;
}

/**
 * Get all class programs
 */
export async function getClassPrograms(): Promise<ClassProgram[]> {
  return await dbreq("SELECT * FROM class_programs ORDER BY name");
}

/**
 * Get programs with vote counts and optionally user's votes
 */
export async function getProgramsWithVotes(
  email?: string | null,
): Promise<ProgramWithVotes[]> {
  let query = `
    SELECT 
      p.*,
      COUNT(v.id) as vote_count
      ${email ? ", uv.vote_order as user_vote_order" : ""}
    FROM class_programs p
    LEFT JOIN class_program_votes v ON p.id = v.program_id
    ${email ? "LEFT JOIN class_program_votes uv ON p.id = uv.program_id AND uv.email = ?" : ""}
    GROUP BY p.id
    ORDER BY vote_count DESC, p.name
  `;

  const params = email ? [email] : [];
  return await dbreq(query, params);
}

/**
 * Get user's voted programs
 */
export async function getUserVotes(
  email: string | null | undefined,
): Promise<ClassProgramVote[]> {
  if (!email) return [];

  return await dbreq(
    `SELECT v.*, p.name, p.room, p.class 
     FROM class_program_votes v 
     JOIN class_programs p ON v.program_id = p.id
     WHERE v.email = ? 
     ORDER BY v.vote_order`,
    [email],
  );
}

/**
 * Save user's votes (replaces all existing votes)
 */
export async function saveUserVotes(
  email: string | null | undefined,
  programIds: number[],
): Promise<void> {
  const selfUser = await getAuth();
  if (!selfUser || !email) throw new Error("Nem vagy bejelentkezve");

  if (programIds.length > 5) {
    throw new Error("Maximum 5 programot választhatsz");
  }

  if (programIds.length !== new Set(programIds).size) {
    throw new Error("Nem szavazhatasz ugyanarra a programra többször");
  }

  await multipledbreq(async (conn) => {
    // Delete existing votes
    await conn.execute("DELETE FROM class_program_votes WHERE email = ?", [
      email,
    ]);

    // Insert new votes
    if (programIds.length > 0) {
      const values = programIds.map((_, index) => `(?, ?, ?)`).join(", ");
      const params = programIds.flatMap((programId, index) => [
        email,
        programId,
        index + 1,
      ]);

      await conn.execute(
        `INSERT INTO class_program_votes (email, program_id, vote_order) VALUES ${values}`,
        params,
      );
    }
  });
}

/**
 * Get vote statistics
 */
export async function getVoteStatistics(): Promise<{
  total_votes: number;
  total_users: number;
  programs_by_votes: Array<{
    program_name: string;
    room: string;
    vote_count: number;
  }>;
}> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");

  const totalVotes = await dbreq(
    "SELECT COUNT(*) as count FROM class_program_votes",
  );
  const totalUsers = await dbreq(
    "SELECT COUNT(DISTINCT email) as count FROM class_program_votes",
  );
  const programsByVotes = await dbreq(`
    SELECT 
      p.name as program_name,
      p.room,
      COUNT(v.id) as vote_count
    FROM class_programs p
    LEFT JOIN class_program_votes v ON p.id = v.program_id
    GROUP BY p.id
    ORDER BY vote_count DESC
    LIMIT 10
  `);

  return {
    total_votes: totalVotes[0]?.count || 0,
    total_users: totalUsers[0]?.count || 0,
    programs_by_votes: programsByVotes,
  };
}
