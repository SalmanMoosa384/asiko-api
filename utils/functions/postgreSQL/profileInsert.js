const dbconfig = require("./dbconfig");
const { Pool } = require("pg");
const { currentTimeForPOSTGESQL } = require("../helper");

const pool = new Pool(dbconfig);

module.exports = function (data) {
  data.employments = JSON.stringify(data.employments);
  pool.connect((connectError, client, done) => {
    if (connectError) {
      console.error("Error connecting to the pool:", connectError);
      return;
    }

    const query = `
      INSERT INTO public.linkedin_profiles(
        id, url, public_id, linkedin_uid, full_name, headline, summary, image_url, location, employments, industry, skills, scraped_at, created_at, updated_at, first_name, last_name, premium, influencer, first_scraped_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (linkedin_uid) DO UPDATE
      SET 
        url = EXCLUDED.url,
        public_id = EXCLUDED.public_id,
        full_name = EXCLUDED.full_name,
        headline = EXCLUDED.headline,
        summary = EXCLUDED.summary,
        image_url = EXCLUDED.image_url,
        location = EXCLUDED.location,
        employments = EXCLUDED.employments,
        industry = EXCLUDED.industry,
        skills = EXCLUDED.skills,
        scraped_at = EXCLUDED.scraped_at,
        updated_at = EXCLUDED.updated_at,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        premium = EXCLUDED.premium,
        influencer = EXCLUDED.influencer
    `;

    client.query(query, Object.values(data), (queryError, result) => {
      done();

      if (queryError) {
        console.error("Error executing query:", queryError);
      } else {
        console.log("Insert or update successful");
      }
    });
  });
};
