export const saveAuthSession = (res) => {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('role', res.role);
    localStorage.setItem('fullName', res.fullName);
}

export const buildUserPayload = (res) => ({
    userId: res.userId,
    userName: res.userName,
    fullName: res.fullName,
    email: res.email,
    role: res.role
})