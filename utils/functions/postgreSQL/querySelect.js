const dbconfig = require("./dbconfig");
const { Pool } = require("pg");

const pool = new Pool(dbconfig);

module.exports = async function (tableName, condition) {
  let client;

  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM ${tableName} ${condition}`
    );

    if (result.rows.length > 0) {
      return { data: result.rows, success: true };
    }
    return { data: result.rows, success: false };
  } catch (error) {
    return { data: error, success: false };
  } finally {
    if (client) {
      client.release();
    }
  }
};
