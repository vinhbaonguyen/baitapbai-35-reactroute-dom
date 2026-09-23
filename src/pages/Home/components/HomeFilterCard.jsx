import React from 'react'

export default function HomeFilterCard({
    title,
    viewAllLink,
    searchValue,
    onSearchChange,
    tabs,
    activeTab,
    onTabChange,
    children,
    navigate
}) {
    return (
        <div className='card'>
            {/* Header */}
            <div className="card__header">
                <h3>{title}</h3>
                {viewAllLink && (
                    <button
                        className='card__more'
                        onClick={() => navigate(viewAllLink)}
                    >
                        View all →

                    </button>
                )}
            </div>
            {/* Search */}
            {onSearchChange && (
                <input
                    className='card__search'
                    type='text'
                    placeholder={`🔍 Search ${title?.toLowerCase()}...`}
                    value={searchValue}
                    onChange={e => onSearchChange(e.target.value)}
                />
            )}
            {/* Tabs */}
            {tabs && (
                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`tabs__btn${activeTab === tab ? ' tabs__btn--active' : ''}`}
                            onClick={()=>onTabChange(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            )}
            {/* Content */}
            {children}
        </div>
    )
}
