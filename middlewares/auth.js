import { verifyToken } from '../config/jwt.js';

export default function jwtAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token xác thực!' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
    req.user = decoded;
    next();
}
