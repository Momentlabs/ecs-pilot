import ECSPilot from './connection';

export default class SessionId {
  static getSessionId() {
    return ECSPilot.get("/sessionId");
  }
}

