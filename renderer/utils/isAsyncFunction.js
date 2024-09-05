export default function isAsyncFunction(func) {
    return typeof func === 'function' && func.constructor.name === 'AsyncFunction';
}
