import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import lottie from 'lottie-web'
import './NotFound.scss'
export default function NotFound() {
    const navigate = useNavigate()
    const svgRef = useRef(null)
    useEffect(() => {
        const anim = lottie.loadAnimation({
            container: svgRef.current,// thay document.getElementById
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'https://assets1.lottiefiles.com/packages/lf20_wnqlfojb.json' // URL Space 404
        })
        // ✅ Cleanup — hủy animation khi component unmount
        return () => anim.destroy()
    }, []) // [] = chỉ chạy 1 lần khi mount
    return (
        <div className='not-found'>
            <div className="not-found__animation" ref={svgRef} />
            <h2>404 - Trang không tồn tại</h2>
            <button onClick={() => navigate('/app')}>Về Trang Chủ</button>
        </div>
    )
}
