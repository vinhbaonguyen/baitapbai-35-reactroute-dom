import { buildConicGradient } from "@/helpers/homeHelpers"
import { useEffect, useRef, useState } from "react"

// Đặt bên ngoài component Home, trước MONTHLY_DATA
export function DonutChart({ data }) {

    const donutRef = useRef(null)
    const [canAnimate, setCanAnimate] = useState(false)
   

    useEffect(() => {
        const donut = donutRef.current
        if (!donut) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCanAnimate(true)
                    observer.unobserve(entry.target)
                }
            },
            {
                threshold: 0.5,
            }
        )

        observer.observe(donut)

        return () => observer.disconnect()
    }, [])

    if (!data || !Array.isArray(data)) {
        return <div className="score__donut" style={{ background: '#e5e7eb' }}>N/A</div>
    }
     const bg = buildConicGradient(data)

    return (
        <div
            ref={donutRef}
            className={`score__donut ${canAnimate
                ? 'animate__animated animate__bounceIn'
                : 'score__donut--waiting'}`}
            style={{
                background: bg,
                '--animate-duration': '5s',
            }}
        />
    )
}

