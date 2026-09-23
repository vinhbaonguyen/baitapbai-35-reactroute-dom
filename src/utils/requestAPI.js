import axios from "axios"

//Dùng Data base json-server
// const API_DOMAIN = 'http://localhost:3001/'
// Xử lý response chung — throw error nếu status không OK
// const handleResponse = async (res) => {
//     console.log("👉 handleResponse chạy",res);
//     if (!res.ok) {
//         // console.log("💥 throw ở đây");
//         throw new Error(`HTTP ${res.status}:${res.statusText}`);
//     }
//     return await res.json()
// }
// export const get = async (path) => {
//     const res = await fetch(API_DOMAIN + path);   
//     return await handleResponse(res)
// }

// export const post = async (path, body) => {
//     const res = await fetch(API_DOMAIN + path, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//     })
//     return await handleResponse(res)
// }

// export const patch = async (path, body) => {
//     const res = await fetch(API_DOMAIN + path, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//     })
//     return await handleResponse(res)
// }

// export const del = async (path) => {
//     const res = await fetch(API_DOMAIN + path, {
//         method: 'DELETE'
//     })
//     return await handleResponse(res)
// }

// back End là Java 

const API_DOMAIN = "http://localhost:9898/api.vinhbaonguyen.com/v0"

const apiClient = axios.create({
    baseURL: API_DOMAIN,
    headers: {'Content-Type':'application/json'}
})

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`            
        }
        return config;
    },
    (error) => Promise.reject(error)
)

// Xử lý response chung — axios tự động throw error nếu status không phải 2xx,
// nên khác với bản fetch cũ, ở đây ta không cần tự check res.ok nữa

// Thêm vào requestAPI.js, sau đoạn request interceptor hiện có
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('accessToken');   // xóa token hết hạn
//             // Tránh loop redirect nếu đang đứng sẵn ở trang login
//             if (window.location.pathname !== '/sign-in') {
//                 window.location.href = '/sign-in';
//             }
//         }
//         return Promise.reject(error);
//     }
// )

const handleError = (error) => {
    console.log("💥 Lỗi gọi API:", error);
    if (error.response) {
        console.log("Chi tiết Error.Response",error.response);        
        const errorResponseData = error.response.data;
        // Backend Java luôn trả dạng: { error: { code, status, message } }
        const errorMessage = errorResponseData?.error?.message || errorResponseData?.error?.status;
        const errorCode = errorResponseData?.error?.code;
        
        // const fullMessage = errorCode ? `${errorCode}-${errorMessage}` : errorMessage
        const err = new Error(errorMessage || "Lỗi không xác định từ server");
        err.code = errorCode || "Không xác định";
        err.fieldErrors = errorResponseData?.fieldErrors || null;  // 👈 THÊM MỚI: đính kèm fieldErrors vào object Error
        // throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`)        
        // const err = new Error(fullMessage);
        throw err; // 👈 giờ throw đúng message tiếng Việt cụ thể       
    } else if(error.request){
        throw new Error("Không kết nối được tới server");
    } else{
        throw new Error(error.message);
    }    
};

export const get = async (path) => {
    try {
        const res = await apiClient.get(path);
        return res.data;
    } catch (error) {
        handleError(error);        
    }
};

export const post = async (path,body) => {
    try {
        const res = await apiClient.post(path,body);
        return res.data;
    } catch (error) {
        handleError(error)
    }
}

export const put = async (path,body) => {
    try {
        const res = await apiClient.put(path,body);
        return res.data;
        
    } catch (error) {
        handleError(error);
    }
}

// Giữ lại patch nếu bạn còn dùng chỗ nào (Java bên bạn có thể chỉ hỗ trợ PUT)
export const patch = async (path, body) => {
    try {
        const res = await apiClient.patch(path, body);
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

export const del = async (path) => {
    try {
        const res = await apiClient.delete(path);
        return res.data;
    } catch (error) {
        handleError(error)
    }
}
