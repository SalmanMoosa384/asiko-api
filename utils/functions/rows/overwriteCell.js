const axios = require("axios");
module.exports = async function (url, value) {
  try {
    let rowsData = await axios({
      method: "post",
      url: `https://api.rows.com/v1/${url}`,
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
