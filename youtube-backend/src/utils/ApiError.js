class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wong",
        errors = [],
        stack = ""
    ){
        super(message)   
        this.statusCode = statusCode;
        //?Why we use this.data = null ?
        this.data = null;
        
        this.message = message;
        this.success = false;
        this.errors = errors;
        
        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }