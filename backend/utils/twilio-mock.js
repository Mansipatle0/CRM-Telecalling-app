// Mock Twilio implementation for demo purposes
// Replace with actual Twilio SDK when credentials are configured

export class TwilioMock {
  constructor(accountSid, authToken) {
    this.accountSid = accountSid
    this.authToken = authToken
  }

  initiateCall(to, from, config = {}) {
    return {
      sid: "CALL_" + Math.random().toString(36).substring(7).toUpperCase(),
      status: "initiated",
      to,
      from,
      duration: 0,
      recordingUrl: null,
      timestamp: new Date().toISOString(),
    }
  }

  getCallStatus(callSid) {
    return {
      sid: callSid,
      status: "active",
      duration: Math.floor(Math.random() * 300),
    }
  }

  endCall(callSid) {
    return {
      sid: callSid,
      status: "completed",
      duration: Math.floor(Math.random() * 300),
    }
  }
}

export function initializeTwilio(accountSid, authToken) {
  if (accountSid && authToken) {
    return new TwilioMock(accountSid, authToken)
  }
  return new TwilioMock("DEMO", "DEMO")
}
