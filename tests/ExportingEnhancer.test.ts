import { Action, createStore, DeepPartial, Reducer } from "redux";
import { v4 as uuid } from "uuid";
import { exportingEnhancer, ExportStrategy } from "../src";

interface TestState {
    readonly a: string;
    readonly slice: {
        readonly b: string;
    };
    readonly c: number;
};

interface TestAction extends Action {
    readonly newState: TestState
};

let currentState: TestState | undefined = undefined;
let currentStateSlice: DeepPartial<TestState> | undefined = undefined;
const fakeExportStrategy: ExportStrategy<TestState> = ({
    getStateSlice: () => currentStateSlice,
    exportStateSlice: (stateSlice) => currentStateSlice = stateSlice
});

const fakeReducer: Reducer<TestState, TestAction> = (state, action) => {
    currentState = action.newState ?? state;

    return currentState;
};
const selector = (state: TestState) => ({ slice: state?.slice });

const stateFactory = (): TestState => ({
    a: uuid(),
    slice: { b: uuid() },
    c: Math.random()
});

const testStoreFactory = (startingState: TestState | undefined = undefined) => createStore(fakeReducer, startingState, exportingEnhancer(selector, fakeExportStrategy));

describe("exportingEnhancer", () => {
    describe("when there is already a slice of state from the export startegy", () => {
        it("restores that slice into a store instance", () => {
            currentStateSlice = {
                slice: { b: uuid() }
            };

            const store = testStoreFactory();

            expect(selector(store.getState())).toEqual(currentStateSlice);
        });
    });

    describe("when there is not already a slice of state from the export startegy", () => {
        it("does not modify the initial state", () => {
            currentStateSlice = undefined;
            const state = stateFactory();

            const store = testStoreFactory(state);

            expect(store.getState()).toEqual(state);
        });
    });

    describe("when the selected slice changes", () => {
        it("gets updated through the export strategy", () => {
            currentStateSlice = undefined;
            const store = testStoreFactory({a: "1", slice: {b: "2"}, c: 3});
            
            const newState = store.dispatch({type: "", newState: stateFactory()}).newState;

            expect(currentStateSlice).toEqual(selector(newState));
        });
    });
});