// Built-in fetch used in Node 18+

async function testServicesApi() {
    try {
        const response = await fetch('http://localhost:3000/api/services?customerTypeCode=EX-A');
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testServicesApi();
