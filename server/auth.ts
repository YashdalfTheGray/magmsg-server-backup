import { RequestHandler } from 'express';

const checkAuthToken: RequestHandler = (req, res, next) => {
  if (!process.env.HUE_REMOTE_TOKEN) {
    res.status(500).json({
      success: false,
      code: 500,
      reason: 'Internal server error',
    });
  } else if (
    req.method === 'POST' &&
    req.body.accessToken &&
    process.env.HUE_REMOTE_TOKEN
  ) {
    if (
      req.body.accessToken.toLowerCase() ===
      process.env.HUE_REMOTE_TOKEN.toLowerCase()
    ) {
      next();
    } else {
      res.status(403).json({
        success: false,
        code: 403,
        reason: 'Not authorized',
      });
    }
  } else if (req.get('Authorization')) {
    const authMethod = req.get('Authorization')?.split(' ')[0];
    const authToken = req.get('Authorization')?.split(' ')[1].toLowerCase();

    if (authMethod !== 'Bearer') {
      res.status(401).json({
        success: false,
        code: 401,
        reason: 'Malformed auth header',
      });
    } else if (authToken !== process.env.HUE_REMOTE_TOKEN.toLowerCase()) {
      res.status(403).json({
        success: false,
        code: 403,
        reason: 'Not authorized',
      });
    } else if (authToken === process.env.HUE_REMOTE_TOKEN.toLowerCase()) {
      next();
    }
  } else {
    res.status(401).json({
      success: false,
      code: 401,
      reason: 'No auth token found in request',
    });
  }
};
