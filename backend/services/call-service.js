import { initializeTwilio } from "../utils/twilio-mock.js"

export async function initiateCall(db, userId, contactId, phoneNumber) {
  const twilio = initializeTwilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

  const callData = twilio.initiateCall(phoneNumber, process.env.TWILIO_PHONE_NUMBER)

  const result = await db.run("INSERT INTO calls (contact_id, user_id, twilio_sid, status) VALUES (?, ?, ?, ?)", [
    contactId,
    userId,
    callData.sid,
    "pending",
  ])

  return {
    id: result.lastID,
    ...callData,
  }
}

export async function updateCallStatus(db, callId, status, duration = 0) {
  await db.run("UPDATE calls SET status = ?, duration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
    status,
    duration,
    callId,
  ])

  const call = await db.get("SELECT * FROM calls WHERE id = ?", [callId])
  return call
}

export async function logCallEvent(db, callId, action, details = null) {
  await db.run("INSERT INTO call_logs (call_id, action, details) VALUES (?, ?, ?)", [callId, action, details])
}

export async function recordDailyKPI(db, userId, callsMade, callsConnected = 0, callsConverted = 0, talkTime = 0) {
  const today = new Date().toISOString().split("T")[0]

  try {
    await db.run(
      `INSERT INTO kpis (user_id, date, calls_made, calls_connected, calls_converted, total_talk_time)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, date) DO UPDATE SET 
       calls_made = calls_made + ?,
       calls_connected = calls_connected + ?,
       calls_converted = calls_converted + ?,
       total_talk_time = total_talk_time + ?`,
      [
        userId,
        today,
        callsMade,
        callsConnected,
        callsConverted,
        talkTime,
        callsMade,
        callsConnected,
        callsConverted,
        talkTime,
      ],
    )
  } catch (error) {
    console.error("Failed to record KPI:", error)
  }
}
