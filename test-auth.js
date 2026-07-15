async function test() {
    try {
        console.log("Testing /api/v1/auth/me with invalid token...");
        const resMe = await fetch('http://localhost:8080/api/v1/auth/me', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer fake-invalid-token' }
        });
        console.log('GET /auth/me Status:', resMe.status);
        console.log('GET /auth/me Text:', await resMe.text());
    } catch (e) {
        console.error("Test failed", e);
    }
}
test();
