let isDevEnvironment = false;

if (process && process.env.NODE_ENV === 'development') {
    isDevEnvironment = true;
}

export { isDevEnvironment };
