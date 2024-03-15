import { Observable, of } from 'rxjs';

export function runWebWorker<Input, Output>(input: Observable<Input>, relativePath: string): Observable<Output> {
    console.debug('Running mock web worker', { input, relativePath });
    return of(null as Output);
}
