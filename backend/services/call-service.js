import { pool } from "../db/schema.js";
import { initializeTwilio } from "../utils/twilio-mock.js";

// ------------------------------
// 📞 INITIATE CALL
// ------------------------------
export async function initiateCall(userId, contactId, phoneNumber) {
  const twilio = initializeTwilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const callData = twilio.initiateCall(
    phoneNumber,
    process.env.TWILIO_PHONE_NUMBER
  );

  const result = await pool.query(
    `INSERT INTO calls (contact_id, user_id, twilio_sid, status, created_at)
     VALUES ($1, $2, $3, 'pending', NOW())
     RETURNING id`,
    [contactId, userId, callData.sid]
  );

  return {
    id: result.rows[0].id,
    ...callData,
  };
}

// ------------------------------
// 🔄 UPDATE CALL STATUS
// ------------------------------
export async function updateCallStatus(callId, status, duration = 0) {
  await pool.query(
    `UPDATE calls 
     SET status = $1, duration = $2, updated_at = NOW()
     WHERE id = $3`,
    [status, duration, callId]
  );

  const call = await pool.query("SELECT * FROM calls WHERE id = $1", [
    callId,
  ]);

  return call.rows[0];
}

// ------------------------------
// 📝 LOG CALL EVENT
// ------------------------------
export async function logCallEvent(callId, action, details = null) {
  await pool.query(
    `INSERT INTO call_logs (call_id, action, details, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [callId, action, details]
  );
}

// ------------------------------
// 📊 DAILY KPI TRACKING
// ------------------------------
export async function recordDailyKPI(
  userId,
  callsMade,
  callsConnected = 0,
  callsConverted = 0,
  talkTime = 0
) {
  const today = new Date().toISOString().split("T")[0];

  try {
    await pool.query(
      `
    INSERT INTO kpis (user_id, date, calls_made, calls_connected, calls_converted, total_talk_time)
    VALUES ($1, $2, $3, $4, $5, $6)
    
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      calls_made = kpis.calls_made + EXCLUDED.calls_made,
      calls_connected = kpis.calls_connected + EXCLUDED.calls_connected,
      calls_converted = kpis.calls_converted + EXCLUDED.calls_converted,
      total_talk_time = kpis.total_talk_time + EXCLUDED.total_talk_time;
  `,
      [
        userId,
        today,
        callsMade,
        callsConnected,
        callsConverted,
        talkTime,
      ]
    );
  } catch (error) {
    console.error("Failed to record KPI:", error);
  }
}
