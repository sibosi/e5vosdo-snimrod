import { NextResponse } from "next/server";
import { gate } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { withConnection } from "@/db/db";

export async function GET() {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "developer");

    const sql = await generateSchemaDump();

    const timestamp = new Date().toISOString().split("T")[0];
    return new Response(sql, {
      status: 200,
      headers: {
        "Content-Type": "text/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="localfile-db_schema_${timestamp}.sql"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating schema dump:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate schema dump" },
      { status: 500 },
    );
  }
}

async function generateSchemaDump(): Promise<string> {
  let sqlOutput = "";
  const databaseName = process.env.MYSQL_DATABASE;

  sqlOutput += `-- Database Schema Dump\n`;
  sqlOutput += `-- Generated on: ${new Date().toISOString()}\n`;
  sqlOutput += `-- Database: ${databaseName}\n`;
  sqlOutput += `-- Note: This dump contains only the schema structure, without data\n\n`;

  sqlOutput += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

  // Get all tables
  const tables = await withConnection(async (connection) => {
    const [rows]: any = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [databaseName],
    );
    return rows;
  });

  // Process each table
  for (const { TABLE_NAME } of tables) {
    // Get CREATE TABLE statement
    const createTableStmt = await withConnection(async (connection) => {
      const [rows]: any = await connection.query(
        `SHOW CREATE TABLE ${TABLE_NAME}`,
      );
      return rows[0]["Create Table"];
    });

    sqlOutput += `-- Table: ${TABLE_NAME}\n`;
    sqlOutput += `DROP TABLE IF EXISTS \`${TABLE_NAME}\`;\n`;
    sqlOutput += createTableStmt + ";\n\n";

    // Get triggers for this table
    const triggers = await withConnection(async (connection) => {
      const [rows]: any = await connection.query(
        `SELECT TRIGGER_NAME 
         FROM INFORMATION_SCHEMA.TRIGGERS 
         WHERE TRIGGER_SCHEMA = ? AND EVENT_OBJECT_TABLE = ?`,
        [databaseName, TABLE_NAME],
      );
      return rows;
    });

    for (const trigger of triggers) {
      const triggerStmt = await withConnection(async (connection) => {
        const [rows]: any = await connection.query(
          `SHOW CREATE TRIGGER \`${trigger.TRIGGER_NAME}\``,
        );
        return rows[0]["SQL Original Statement"];
      });

      sqlOutput += `-- Trigger: ${trigger.TRIGGER_NAME}\n`;
      sqlOutput += `DROP TRIGGER IF EXISTS \`${trigger.TRIGGER_NAME}\`;\n`;
      sqlOutput += triggerStmt + ";\n\n";
    }
  }

  // Get stored procedures
  const procedures = await withConnection(async (connection) => {
    const [rows]: any = await connection.query(
      `SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
       WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'`,
      [databaseName],
    );
    return rows;
  });

  for (const { ROUTINE_NAME } of procedures) {
    const procStmt = await withConnection(async (connection) => {
      const [rows]: any = await connection.query(
        `SHOW CREATE PROCEDURE \`${ROUTINE_NAME}\``,
      );
      return rows[0]["Create Procedure"];
    });

    sqlOutput += `-- Procedure: ${ROUTINE_NAME}\n`;
    sqlOutput += `DROP PROCEDURE IF EXISTS \`${ROUTINE_NAME}\`;\n`;
    sqlOutput += `DELIMITER $$\n`;
    sqlOutput += procStmt + "$$\n";
    sqlOutput += `DELIMITER ;\n\n`;
  }

  // Get stored functions
  const functions = await withConnection(async (connection) => {
    const [rows]: any = await connection.query(
      `SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
       WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'FUNCTION'`,
      [databaseName],
    );
    return rows;
  });

  for (const { ROUTINE_NAME } of functions) {
    const funcStmt = await withConnection(async (connection) => {
      const [rows]: any = await connection.query(
        `SHOW CREATE FUNCTION \`${ROUTINE_NAME}\``,
      );
      return rows[0]["Create Function"];
    });

    sqlOutput += `-- Function: ${ROUTINE_NAME}\n`;
    sqlOutput += `DROP FUNCTION IF EXISTS \`${ROUTINE_NAME}\`;\n`;
    sqlOutput += `DELIMITER $$\n`;
    sqlOutput += funcStmt + "$$\n";
    sqlOutput += `DELIMITER ;\n\n`;
  }

  sqlOutput += `SET FOREIGN_KEY_CHECKS=1;\n`;

  return sqlOutput;
}
