import * as _path from "path";

export function path(path: string): string {
    if (path.startsWith("/")) {
        return path;
    }

    const fromProjectRoot = _path.join.bind(path, __dirname, "../../");
    return fromProjectRoot(path);
}

export function assign<T>(target: Partial<T>, ...sources: Array<Partial<T>>) {
    return Object.assign(target, ...sources.map(x =>
        Object.entries(x)
            .filter(([key, value]) => value !== undefined)
            .reduce((obj, [key, value]) => ((obj as any)[key] = value, obj), {})
    ));
}

export function parseMemo(memo: string): Memo {
    const [version, appId, paymentId] = memo.split("-");
    return {appId: appId, paymentId: paymentId};
}

export type Memo = { appId: string, paymentId: string };
