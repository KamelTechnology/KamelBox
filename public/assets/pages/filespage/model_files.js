import { onDestroy } from "../../lib/skeleton/index.js";
import rxjs from "../../lib/rx.js";
import ajax from "../../lib/ajax.js";

const selection$ = new rxjs.BehaviorSubject([]);

onDestroy(() => selection$.next([]));

export function addSelection(name, type) {
    selection$.next(selection$.value.concat({ name, type }));
}

export function clearSelection() {
    selection$.next([]);
}

export function getSelection$() {
    return selection$.asObservable();
}

// export function ls() {
//     return rxjs.from(new Error("missing cache")).pipe(
//         rxjs.catchError(() => rxjs.of({ files: null })),
//         rxjs.mergeMap(({ files: filesInCache }) => ajax({
//             url: `/api/files/ls?path=${path}`,
//             responseType: "json"
//         }).pipe(
//             rxjs.map(({ responseJSON }) => responseJSON),
//             rxjs.filter(({ filesInRemote }) => {
//                 if (!Array.isArray(filesInCache)) return true;
//                 if (filesInCache.length != filesInRemote.length) return true;
//                 for (let i=0; i<filesInCache.length; i++) {
//                     if (filesInCache[i].name !== filesInRemote[i].name) return true;
//                 }
//                 return false;
//             }),
//         )),
//     )
// }

export function ls() {
    return rxjs.pipe(
        rxjs.mergeMap((path) => ajax({
            url: `/api/files/ls?path=${path}`,
            responseType: "json"
        }).pipe(rxjs.map(({ responseJSON }) => ({
            files: responseJSON.results.sort(sortByDefault),
            path,
        })))),
    );
}

const sortByDefault = (fileA, fileB) => {
    if (fileA.type !== fileB.type) {
        if (fileA.type === "file") return +1;
        return -1;
    }
    // if (fileA.name < fileB.name) {
    //     return -1
    // }
    return 0;
};
