export default async function wait(milliseconds = 1000) {
    return new Promise((r) => setTimeout(r, milliseconds));
}