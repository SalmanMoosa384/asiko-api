const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

const supabaseGetEmail = async function (req) {
    let { agentName, agentPhone, officeName, license, state } = req.body;
    agentPhone = agentPhone ? agentPhone : "12199392323000000asas";
    license = license ? license : "12199392323000000asas";
    agentName = agentName ? agentName : "12199392323000000asas";
    officeName = officeName ? officeName : "12199392323000000asas";
    state = state ? state : "12199392323000000asas";
  
    let { data, error } = await supabase
      .from("state_homes")
      .select('"emails"')
      .or(
        `or("lisence_number".ilike."%${license}%","agent_lisence".ilike."%${license}%"),and("agent_phone_number".ilike."${agentPhone}","agent_full_name".ilike."${agentName}"),and("agency_name".ilike."${officeName}","agent_full_name".ilike."${agentName}"),and("state".ilike."${state}","agent_full_name".ilike."${agentName}")`
      )
      .limit(1);
  
    if (data?.length > 0) {
      return{
        data: data ? { email: data[0]?.emails } : [],
        message: "success",
      };
    } else {
      let { data, error } = await supabase
        .from("state_realtor")
        .select('"Email"')
        .or(
          `and(or("Office".ilike."${agentPhone}","Mobile".ilike."${agentPhone}"),"Full Name".ilike."${agentName}"),and("Office Name".ilike."${officeName}","Full Name".ilike."${agentName}"),and("State".ilike."${state}","Full Name".ilike."${agentName}")`
        )
        .limit(1);
  
      if (data?.length > 0) {
        return{
          data: data ? { email: data[0]?.Email } : [],
          message: "success",
        };
      } else {
        let { data, error } = await supabase
          .from("state_remax")
          .select('"Email 1","Email 2"')
          .or(
            `"License Number".ilike."%${license}%",and("Phone Number".ilike."${agentPhone}","Full Name".ilike."${agentName}"),and("Office Name".ilike."${officeName}","Full Name".ilike."${agentName}"),and("Office State".ilike."${state}","Full Name".ilike."${agentName}")`
          )
          .limit(1);
  
        if (data?.length > 0) {
          return{
            data: data
              ? { email: data[0]?.["Email 1"], email2: data[0]?.["Email 2"] }
              : [],
            message: "success",
          };
        } else {
          let { data, error } = await supabase
            .from("state_scraper_1")
            .select('"Email"')
            .or(
              `and(or("Office Phone".ilike."${agentPhone}","Cell Phone".ilike."${agentPhone}"),"Full Name".ilike."${agentName}"),and("Office Name".ilike."${officeName}","Full Name".ilike."${agentName}"),and("Office State".ilike."${state}","Full Name".ilike."${agentName}")`
            )
            .limit(1);
  
          if (data?.length > 0) {
            return{
              data: data ? { email: data[0]?.Email } : [],
              message: "success",
            };
          } else {
            let { data, error } = await supabase
              .from("state_scraper_2")
              .select('"email_address"')
              .or(
                `and(or("Phone_Number".ilike."${agentPhone}","Fax_Number".ilike."${agentPhone}"),"Full_Name".ilike."${agentName}"),and("State".ilike."${state}","Full_Name".ilike."${agentName}")`
              )
              .limit(1);
  
            if (data?.length > 0) {
              return{
                data: data ? { email: data[0]?.email_address } : [],
                message: "success",
              };
            } else {
              return{ message: "failed" };
            }
          }
        }
      }
    }
}

module.exports={supabaseGetEmail}