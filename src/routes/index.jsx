import React from 'react'
import LayoutDefault from '../layouts/LayoutDefault'
import Home from '../pages/Home/Home'
import Contact from '../pages/Contact'
import BlogLayout from '../pages/blog/BlogLayout'
import BlogNews from '../pages/blog/BlogNews'
import BlogRelated from '../pages/blog/BlogRelated'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import About from '../pages/About'
import Register from '../pages/Register/Register'
import Course from '../pages/Course/Course'
import Class from '../pages/Classes/Class'
import SignIn from '../pages/SignIn/SignIn'
import ProtectRoute from '../components/ProtectRoute'
import User from '../pages/Users/User'
import Profile from '../pages/Profile/Profile'
import NotFound from '../pages/NotFound/NotFound'
import Lecture from '../pages/Lecturer/Lecture'
import Student from '@/pages/Student/Student'
import ClassSchedule from '@/pages/ClassSchedule/ClassSchedule'
import Score from '@/pages/Score/Score'
import AuditLogPage from '@/pages/AuditLogPage/AuditLogPage'

const routes = [
    { path: '/', element: <Navigate to='/sign-in' replace /> },
    { path: '/sign-in', element: <SignIn /> },
    { path: '/register', element: <Register /> },
    // /app → LayoutDefault được bảo vệ bởi ProtectedRoute
    {
        path: '/app',                   // route cha dùng absolute
        element: (
            <ProtectRoute>
                <LayoutDefault />
            </ProtectRoute>
        ),
        children: [
            { index: true, element: <Home /> },
            { path: 'course', element: <Course /> },
            { path: 'class', element: <Class /> },
            { path: 'student', element: <Student /> },
            { path: 'user', element: <User /> },
            { path: 'profile', element: <Profile /> },
            { path: 'about', element: <About /> },
            { path: 'contact', element: <Contact /> },
            { path: 'lecture', element: <Lecture /> },
            { path: 'schedule', element: <ClassSchedule /> },
            { path: 'score', element: <Score /> },
            { path: 'auditLog', element: <AuditLogPage/>},
            {
                path: 'blog',
                element: <BlogLayout />,
                children: [
                    { path: 'news', element: <BlogNews /> },
                    { path: 'related', element: <BlogRelated /> }
                ]
            },
        ]
    },
    { path: '*', element: <NotFound /> },
]
export const router = createBrowserRouter(routes)