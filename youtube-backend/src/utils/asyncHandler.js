const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
}



export { asyncHandler }


//* const asyncHandler = (func) => { async () => {} } 
//* Below syntax is same as above.

/* *** 2nd Way using async await ***

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        });
    }
}

*/
