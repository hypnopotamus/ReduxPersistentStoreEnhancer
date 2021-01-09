import { DeepPartial } from "redux";
import exportingEnhancer from "./ExportingEnhancer";
import { ExportStrategy } from "./ExportStrategy";

const localStorageStragy = <TState>(storageKey: string): ExportStrategy<TState> => ({
    getStateSlice: () => {
        const storedSlice = localStorage.getItem(storageKey);
        if (storedSlice) return JSON.parse(storedSlice);

        return undefined;
    },
    exportStateSlice: (stateSlice) => {
        if (stateSlice) localStorage.setItem(storageKey, JSON.stringify(stateSlice));
        else localStorage.removeItem(storageKey);
    }
});

export const localStorageEnhancer = <TState>(selector: (state: TState) => DeepPartial<TState>) => exportingEnhancer(selector, localStorageStragy(JSON.stringify(selector)));
export default localStorageEnhancer;