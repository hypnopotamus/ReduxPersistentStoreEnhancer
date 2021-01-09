import { DeepPartial } from "redux";

export interface ExportStrategy<TState> {
    readonly getStateSlice: () => DeepPartial<TState> | undefined;
    readonly exportStateSlice: (stateSlice: DeepPartial<TState> | undefined) => void;
}