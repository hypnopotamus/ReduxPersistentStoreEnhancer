import { Action, AnyAction, DeepPartial, PreloadedState, Reducer, StoreEnhancer, StoreEnhancerStoreCreator } from "redux";
import { ExportStrategy } from "./ExportStrategy";

//todo: redux PR to correct the enhancer typings
/*
original (https://github.com/reduxjs/redux/tree/3cf3b0f48c4093aaa094eedb11efa8656e9b0309 : /src/types/store.ts ; 1/9/2021):
export type StoreEnhancer<Ext = {}, StateExt = never> = (
  next: StoreEnhancerStoreCreator<Ext, StateExt>
) => StoreEnhancerStoreCreator<Ext, StateExt>
export type StoreEnhancerStoreCreator<Ext = {}, StateExt = never> = <
  S = any,
  A extends Action = AnyAction
>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>
) => Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext

new (from package v4.0.5 1/9/2021):
//this gives the typescript compiler the information that the resulting state shape will always be based on the original
export type StoreEnhancer<TState = any, Ext = {}, StateExt = {}> = (
  next: StoreEnhancerStoreCreator<TState>
) => StoreEnhancerStoreCreator<TState, Ext, StateExt>
export type StoreEnhancerStoreCreator<TState = any, Ext = {}, StateExt = {}> = <
  S extends TState,
  A extends Action = AnyAction
>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>
) => Store<S & StateExt, A> & Ext

//this tells createStore (or other store creators) to pass the unenhanced state shape type to the enhancers
//resulting in a store with the correct state type
//if this isn't done then the type of the resulting store is Store<S, A> & S because the generics no longer align
export interface StoreCreator {
  <S, A extends Action, Ext, StateExt>(
    reducer: Reducer<S, A>,
    enhancer?: StoreEnhancer<S, Ext, StateExt>
  ): Store<S & StateExt, A> & Ext
  <S, A extends Action, Ext, StateExt>(
    reducer: Reducer<S, A>,
    preloadedState?: PreloadedState<S>,
    enhancer?: StoreEnhancer<S, Ext>
  ): Store<S & StateExt, A> & Ext
}
*/
//todo: publish this the right way as an npm package, need to do some research on what is and is not the right way
//todo: setup github CD to run unit tests and then publish new versions to npm's public registry

const exportingReducerDecorator = <TState, S extends TState, A extends Action = AnyAction>(
    reducer: Reducer<S, A>,
    selector: (state: TState) => DeepPartial<TState>,
    exportStateSlice: (state: DeepPartial<TState>) => void
): Reducer<S, A> => (state, action) => {
    const newState = reducer(state, action);

    exportStateSlice(selector(newState));

    return newState;
}

export const exportingEnhancer = <TState>(
    selector: (state: TState) => DeepPartial<TState>,
    strategy: ExportStrategy<TState>
): StoreEnhancer<TState> => (next: StoreEnhancerStoreCreator<TState>) => <S extends TState, A extends Action = AnyAction>(
    reducer: Reducer<S, A>,
    state?: PreloadedState<S>
) => {
    const importedSlice = strategy.getStateSlice();
    const restoredState = (importedSlice ? { ...state, ...importedSlice } : state) as PreloadedState<S> | undefined;
    const exportingReducer = exportingReducerDecorator(reducer, selector, strategy.exportStateSlice);

    return next(exportingReducer, restoredState);
};
export default exportingEnhancer;