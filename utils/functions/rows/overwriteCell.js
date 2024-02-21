const axios = require("axios");
module.exports = async function (cell, value) {
  try {
    let rowsData = await axios({
      method: "post",
      url: `https://api.rows.com/v1/spreadsheets/UzDiH9DrZfVDxprJWZTeX/tables/53814c6b-7d82-4662-9711-2025f339f910/cells/${cell}`,
      data: {
        cells: [
          [
            {
              value: value,
            },
          ],
        ],
      },
      headers: {
        Authorization: `Bearer ${process.env.ROWS_API}`,
        "Content-Type": "application/json",
      },
    });

    return { data: "data insert successfull in rows", success: true };
  } catch (ex) {
    return { ex, success: false };
  }
};
