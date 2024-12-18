import mainSlice from "../mainSlice";
import { store } from "../store";

const ONE_SECOND_IN_MS = 1000;

export class Stats {
    periodStartTime = null;
    frameStartTime = null;
    msPerFrameSum = 0;
    memoryMBSum = 0;
    numMeasurements = 0;

    constructor() {}

    begin() {
        if (!this.periodStartTime) {
            this.periodStartTime = (performance ?? Date).now();
        }
        this.beginTime = (performance ?? Date).now();
    }

    end() {
        const nowTime = (performance ?? Date).now();
        const msPerFrame = nowTime - this.beginTime;
        const periodDuration = nowTime - this.periodStartTime;
        const memoryMB = window?.performance?.memory?.usedJSHeapSize ?? 0;
        this.msPerFrameSum += msPerFrame;
        this.memoryMBSum += memoryMB;
        this.numMeasurements++;
        if (periodDuration >= ONE_SECOND_IN_MS) {
            const memoryMB = this.memoryMBSum / this.numMeasurements;
            const ms = this.msPerFrameSum / this.numMeasurements;
            const fps = this.numMeasurements;
            store.dispatch(
                mainSlice.actions.setPerformanceStats({ fps, ms, memoryMB }),
            );
            this.msPerFrameSum = 0;
            this.numMeasurements = 0;
            this.periodStartTime = null;
        }
    }
}
