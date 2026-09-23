import { useDispatch, useSelector } from 'react-redux'
import * as courseService from '../services/courseService'
import * as studentService from '../services/studentService'
import * as lectureService from '../services/lectureService'
import * as classesService from '../services/classService'
import * as classScheduleService from '../services/classScheduleService'
import * as studentClassService from '../services/studentClassService'
import * as studentCourseService from '../services/studentCourseService'
import * as specialtyService from '../services/specialtyService'
import { setMasterData } from '@/actions/masterDataAction';
import { useEffect } from 'react'

export default function useFetchMasterData() {
    const dispatch = useDispatch();
    // ⚠️ Đổi "auth" thành đúng tên key bạn đặt lúc combineReducers (VD: combineReducers({ auth: authReducer, ... }))
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    // Code bên dưới là cách cũ, dùng Promise.all() 
    // → nếu 1 cái fail thì cả 7 cái đều fail, không lấy được dữ liệu
    // const loaded = useSelector(selectMasterLoaded);
    // useEffect(() => {
    //     if (loaded) return;
    //     Promise.all([
    //         courseService.getAll(),
    //         studentService.getAll(),
    //         lectureService.getAll(),
    //         classesService.getAll(),
    //         classScheduleService.getAll(),
    //         studentClassService.getAll(),
    //         studentCourseService.getAll(),
    //         specialtyService.getAll()

    //     ]).then(
    //         ([courses, students, lectures, classes, classSchedules,
    //             studentClass, studentCourse, specialties]) => {
    //             dispatch(setMasterData({
    //                 courses, students, lectures, classes, classSchedules,
    //                 studentClass, studentCourse, specialties
    //             }));
    //         });
    // }, [loaded, dispatch]);
    useEffect(() => {
        // ✅ Chưa đăng nhập -> không fetch gì cả, tránh 401 hàng loạt
        if (!isLoggedIn) return; 
        Promise.allSettled([
            courseService.getAll(),
            studentService.getAll(true),      // 🔥 nạp cả COMPLETED — đủ data cho thống kê sau này
            lectureService.getAll(),
            classesService.getAll(),
            classScheduleService.getAll(),
            studentClassService.getAll(),
            studentCourseService.getAll(),
            specialtyService.getAll()
        ]).then((results) => {
            const [courses,
                students,
                lectures,
                classes,
                classSchedules,
                studentClass,
                studentCourse,
                specialties] = results.map(r => r.status === 'fulfilled' ? r.value : []);// fail → mảng rỗng, không chặn cái khác
            dispatch(setMasterData(
                {
                    courses,
                    students,
                    lectures,
                    classes,
                    classSchedules,
                    studentClass,
                    studentCourse,
                    specialties
                }
            ));
        });

    }, [dispatch,isLoggedIn]);

}
