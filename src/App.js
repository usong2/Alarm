import React, { useState, useEffect } from 'react';
import { of, interval, concat, Subject } from 'rxjs';
import { takeWhile, takeUntil, scan, startWith, repeatWhen, share, filter } from 'rxjs/operators';
// import './styles.css';

const countdown$ = interval(200).
    pipe(
        startWith(5),
        scan(time => time - 1),
        takeWhile(time => time > 0)
    ).pipe(share());

const action$ = new Subject();
const snooze$ = action$.pipe(filter(action => action === 'snooze'));
const dismiss$ = action$.pipe(filter(action => action === 'dismiss'));

const snoozeableAlarm$ = concat(countdown$, of('Wake up! 🎉')).pipe(repeatWhen(() => snooze$));

const observable$ = concat(snoozeableAlarm$.pipe(
    takeUntil(dismiss$)
), of('Have a nice day! 🎃'));

function App() {
  const [state, setState] = useState();
  useEffect(() => {
      const sub = observable$.subscribe(setState);
      return () => sub.unsubscribe();
  }, [])

  return (
      <>
          <h3>Alarm Clock</h3>
          <div className="display">{state}</div>
          <button className="snooze" onClick={() => action$.next('snooze')}>Snooze</button>
          <button className="dismiss" onClick={() => action$.next('dismiss')}>Dismiss</button>
      </>
  );
}

export default App;
