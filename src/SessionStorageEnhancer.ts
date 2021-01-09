import { DeepPartial } from "redux";
import exportingEnhancer from "./ExportingEnhancer";
import { ExportStrategy } from "./ExportStrategy";

const sessionStorageStragy = <TState>(storageKey: string): ExportStrategy<TState> => ({
    getStateSlice: () => {
        const storedSlice = sessionStorage.getItem(storageKey);
        if (storedSlice) return JSON.parse(storedSlice);

        return undefined;
    },
    exportStateSlice: (stateSlice) => {
        if (stateSlice) sessionStorage.setItem(storageKey, JSON.stringify(stateSlice));
        else sessionStorage.removeItem(storageKey);
    }
});

export const sessionStorageEnhancer = <TState>(selector: (state: TState) => DeepPartial<TState>) => exportingEnhancer(selector, sessionStorageStragy(JSON.stringify(selector)));
export default sessionStorageEnhancer;