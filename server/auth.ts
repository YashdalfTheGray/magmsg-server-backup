import { RequestHandler } from 'express';

export type AuthMiddlewareProvider = (authToken: string) => RequestHandler;

const checkAuthToken: AuthMiddlewareProvider = (givenAuthToken) => (
  req,
  res,
  next
) => {
  if (!givenAuthToken) {
    res.status(500).json({
      success: false,
      code: 500,
      reason: 'Internal server error',
    });
  } else if (req.method === 'POST' && req.body.accessToken && givenAuthToken) {
    if (req.body.accessToken.toLowerCase() === givenAuthToken.toLowerCase()) {
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
    } else if (authToken !== givenAuthToken.toLowerCase()) {
      res.status(403).json({
        success: false,
        code: 403,
        reason: 'Not authorized',
      });
    } else if (authToken === givenAuthToken.toLowerCase()) {
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

export { checkAuthToken };
