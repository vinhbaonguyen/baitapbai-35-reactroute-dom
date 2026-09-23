// hàm tạo Score status cho biểu đồ Score
export const buildScoreStats = (scores) => {
    const pass = scores.filter(s => s.result === 'Pass').length;
    const fail = scores.filter(s => s.result === 'Fail').length;
    const pending = scores.filter(s => s.result !== 'Pass' && s.result !== 'Fail').length;

    const total = scores.length || 1;

    return {
        pass,
        fail,
        pending,
        percent: {
            pass: Math.round(pass / total * 100),
            fail: Math.round(fail / total * 100),
            pending: Math.round((total - (pass + fail)) * 100)
        }
    }
}

export const getDonutData = (stats) => [
    { label: 'Pass', value: stats.percent.pass, color: '#22c55e' },
    { label: 'Fail', value: stats.percent.fail, color: '#ef4444' },
    { label: 'Pending', value: stats.percent.pending, color: '#f59e0b' },
]

export const getLegendData = (stats) => [
    { label: 'Pass', color: '#22c55e', count: stats.pass },
    { label: 'Fail', color: '#ef4444', count: stats.fail },
    { label: 'Pending', color: '#f59e0b', count: stats.pending },

]

export const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'GOOD MORNING'
    if (h < 18) return 'GOOD AFTERNOON'
    return 'GOOD EVENING'
}
// Tạo chuỗi conic-gradient động từ SCORE_DATA
export const buildConicGradient = (data) => {
    let acc = 0
    const stops = data.map(d => {
        const from = acc
        acc += d.value
        return `${d.color} ${from}% ${acc}%`
    })
    return `conic-gradient(${stops.join(', ')})`
}

export const feeDonutData = (feeOverview) => [
    { label: 'Đã Đóng', value: feeOverview.percentPaid, color: '#22c55e' },
    { label: 'Chưa Đóng', value: feeOverview.percentUnpaid, color: '#ca8a04' },

]