# ReduxPersistentStoreEnhancer

The primary purpose of this package is to persist slices of a redux store's state.  Two default enhancers are included, session and local storage.  A generic enhancer is also included so that this functionality can be extended (e.g. export state slices to an API).

The state to be persisted is expressed as a slice of the state and supplied to the enhancer via a selector function which returns a DeepPartial of the original state shape.

This use case came about originally working on a React UI application which included a session object in the global state shape stored in redux to be delivered to react components.  Upon refresh of the page that session data was gone.

usage:
```typescript
interface State {
    ///...
    readonly slice: {
        readonly b: string;
    };
};

const exportStrategy: ExportStrategy<State> = ({
    getStateSlice: () => /*get the current slice*/,
    exportStateSlice: (stateSlice) => /*send out the changed slice*/
});

const selector = (state: State) => ({ slice: state?.slice });

const store = createStore(reducer, initialState, exportingEnhancer(selector, exportStrategy));
```