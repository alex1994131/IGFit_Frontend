export const axios_config = {
    headers: {
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/json'
    },
    baseURL: 'https://faasd.tyap.cloud/function/userapi/'//'http://localhost:3000/'
};

export const eodhistorical_api = {
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    baseURL: 'https://eodhistoricaldata.com/api/search/'
}
