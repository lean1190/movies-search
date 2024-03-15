import { fromWorker } from 'observable-webworker';
import { Observable } from 'rxjs';

export function runWebWorker<Input, Output>(input: Observable<Input>, relativePath: string): Observable<Output> {
    return fromWorker<Input, Output>(() => new Worker(
        new URL(relativePath, import.meta.url),
        { type: 'module' }
    ), input);
}
