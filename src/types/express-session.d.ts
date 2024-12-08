import "express-session";

// adds the user field to SessionData interface in express-session
declare module 'express-session' {
  interface SessionData {
    user: { [key: string]: any };
  }
}