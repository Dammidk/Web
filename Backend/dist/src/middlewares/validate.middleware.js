"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const result = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            req.body = result.body;
            req.query = result.query;
            req.params = result.params;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.middleware.js.map