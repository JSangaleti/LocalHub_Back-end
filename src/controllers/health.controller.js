const check = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'API funcionando normalmente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { check };