const API_DOMAIN = 'http://localhost:3001/'
// Xử lý response chung — throw error nếu status không OK
const handleResponse = async (res) => {
    console.log("👉 handleResponse chạy",res);
    if (!res.ok) {
        // console.log("💥 throw ở đây");
        throw new Error(`HTTP ${res.status}:${res.statusText}`);
    }
    return await res.json()
}

export const get = async (path) => {
    const res = await fetch(API_DOMAIN + path);   
    return await handleResponse(res)
}

export const post = async (path, body) => {
    const res = await fetch(API_DOMAIN + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    return await handleResponse(res)
}

export const patch = async (path, body) => {
    const res = await fetch(API_DOMAIN + path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    return await handleResponse(res)
}

export const del = async (path) => {
    const res = await fetch(API_DOMAIN + path, {
        method: 'DELETE'
    })
    return await handleResponse(res)
}