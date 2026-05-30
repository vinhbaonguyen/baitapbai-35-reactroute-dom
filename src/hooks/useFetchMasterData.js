import { selectMasterLoaded } from '@/store/selectors/masterDataSelectors';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as courseService from '../services/courseService'
import * as studentService from '../services/studentService'
import * as lectureService from '../services/lectureService'
import * as classesService from '../services/classService'
import * as classScheduleService from '../services/classScheduleService'
import { setMasterData } from '@/actions/masterDataAction';

export default function useFetchMasterData() {
    const dispatch = useDispatch();
    const loaded = useSelector(selectMasterLoaded);

    useEffect(() => {
        if (loaded) return;
        Promise.all([
            courseService.getAll(),
            studentService.getAll(),
            lectureService.getAll(),
            classesService.getAll(),
            classScheduleService.getAll(),
            
        ]).then(([courses, students, lectures,classes,classSchedule]) => {
            dispatch(setMasterData({ courses, students, lectures,classes,classSchedule }));
        });
    }, [loaded, dispatch]);
}
