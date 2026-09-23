// Action types cho Score

export const SET_SCORES = 'SET_SCORES';
export const ADD_SCORE = 'ADD_SCORE';
export const UPDATE_SCORE = 'UPDATE_SCORE';
export const DELETE_SCORE = 'DELETE_SCORE';

// Action creators

export const setScores = (scores) => ({
    type: SET_SCORES,
    payload: scores
});

export const addScore = (score) => ({
    type: ADD_SCORE,
    payload: score
});

export const updateScoreAction = (id, data) => ({
    type: UPDATE_SCORE,
    payload: { id, data }
});

export const deleteScoreAction = (id) => ({
    type: DELETE_SCORE,
    payload: id
});