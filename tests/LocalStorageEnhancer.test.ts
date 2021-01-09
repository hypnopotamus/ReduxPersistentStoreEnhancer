import { Action, createStore, Reducer } from "redux";
import { v4 as uuid } from "uuid";
import { localStorageEnhancer } from "../src";

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

const testStoreFactory = (startingState: TestState | undefined = undefined) => createStore(fakeReducer, startingState, localStorageEnhancer(selector));

describe("localStorageEnhancer", () => {
    describe("when there is already a slice of state in local storage", () => {
        it("restores that slice into a store instance", () => {
            const currentStateSlice = {
                slice: { b: uuid() }
            };
            localStorage.setItem(JSON.stringify(selector), JSON.stringify(currentStateSlice));

            const store = testStoreFactory();

            expect(selector(store.getState())).toEqual(currentStateSlice);
        });
    });

    describe("when there is not already a slice of state in local storage", () => {
        it("does not modify the initial state", () => {
            localStorage.removeItem(JSON.stringify(selector));
            const state = stateFactory();

            const store = testStoreFactory(state);

            expect(store.getState()).toEqual(state);
        });
    });

    describe("when the selected slice changes", () => {
        it("gets updated in local storage", () => {
            localStorage.removeItem(JSON.stringify(selector));
            const store = testStoreFactory({a: "1", slice: {b: "2"}, c: 3});
            
            const newState = store.dispatch({type: "", newState: stateFactory()}).newState;

            const storedSlice = localStorage.getItem(JSON.stringify(selector));
            expect(storedSlice).toBeTruthy();
            const currentStateSlice = JSON.parse(storedSlice!);
            expect(currentStateSlice).toEqual(selector(newState));
        });
    });
});