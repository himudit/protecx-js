import * as jwt from "jsonwebtoken";

export interface ProtecXServerConfig {
    publicKeyPEM: string;
}

export class ProtecXServer {
    private publicKeyPEM: string;

    constructor(config: ProtecXServerConfig) {
        this.publicKeyPEM = config.publicKeyPEM;
    }

    verifyToken(tokenString: string) {
        if (!tokenString) return null;

        try {
            const decodedClaims = jwt.verify(tokenString, this.publicKeyPEM, {
                algorithms: ['RS256']
            });

            return decodedClaims;
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                 console.error("Token has expired");
            } else if (err.name === 'JsonWebTokenError') {
                 console.error("Invalid token or signature");
            } else {
                 console.error("Failed to verify token", err.message);
            }
            return null;
        }
    }



    middleware() {
        return (req: any, res: any, next: Function) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = this.verifyToken(token);

            if (!decoded) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            req.user = decoded;
            next();
        };
    }
}
