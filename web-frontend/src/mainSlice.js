import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        player: {},
        performanceStats: {
            fps: 0,
            ms: 0,
            memoryMB: 0,
        },
    },
    reducers: {
        setPlayer: (state, action) => {
            state.player = action.payload;
        },
        setPerformanceStats: (state, action) => {
            state.performanceStats = action.payload;
        },
    },
});

export default mainSlice;
