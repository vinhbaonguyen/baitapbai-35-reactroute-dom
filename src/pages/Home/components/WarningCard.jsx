import React from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export default function WarningCard({ icon, title, items, renderItem, footer, type, variants }) {
    const isEmpty = !items || items.length === 0;

    const cardClass = [
        'warning-card',
        isEmpty ? 'warning-card--empty' : '',
        type ? `warning-card--${type}` : ''
    ].filter(Boolean).join(' ');

    return (
        /* 2. Đổi thành motion.div và nhận variants từ cha truyền xuống */
        <motion.div
            className={cardClass}
            variants={variants}
            whileHover={{
                y: -6,
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
                transition: { duration: 0.2 }
            }}
        >
            {isEmpty
                ? (
                    <div className='warning-card__empty'>
                        Không có dữ liệu
                    </div>
                )
                : (
                    <>
                        <div className='warning-card__header'>
                            <span className="warning-card__header-icon">{icon}</span>
                            <span className="warning-card__header-text">{title}</span>
                        </div>
                        <div className='warning-card__content'>
                            {items.slice(0, 4).map(renderItem)}

                            {items.length > 4 && (
                                <div className='warning-card__more'>
                                    +{items.length - 4} Khác
                                </div>
                            )}
                        </div>
                    </>
                )
            }
            <div className="warning-card__footer">
                {footer}
            </div>
        </motion.div>
    )
}