const React = (function () {
  let stateIdx = 0;
  const stateArray = [];

  function useState(initVal) {
    const _idx = stateIdx;
    if (stateArray.length === _idx) {
      stateArray.push(initVal);
    }

    const state = stateArray[_idx];

    const setState = (newVal) => {
      if (typeof newVal === "function") {
        stateArray[_idx] = newVal(state);
      } else {
        if (stateArray[_idx] !== newVal) {
          stateArray[_idx] = newVal;
        }
      }
    };

    stateIdx += 1;

    return [state, setState];
  }

  let effectIdx = 0;
  const effectArray = [];

  function useEffect(callback, dependencies) {
    const _index = effectIdx;
    // 현재 위치에 저장되어 있는 값이 기존의 dependency이다
    // 최초 실행 시에는 이 값은 undefined일 것이다
    const oldDependencies = effectArray[_index];

    // useEffect 최초 실행 시에는 무조건 callback을 실행하므로 default 값은 true로 설정
    let hasChanged = true;
    // oldDependencies가 존재한다면 현재 받은 dependencies와 비교
    if (oldDependencies) {
      // Array.some 함수를 사용하여 조건을 만족하는 값이 존재하는지 확인
      hasChanged = dependencies.some(
        // 조건: 하나라도 동일하지 않은 값이 있는지
        (dep, i) => !Object.is(dep, oldDependencies[i])
      );
    }

    // 최초 실행, 또는 dependencies 중 변경된 값이 있다면 callback 실행
    if (hasChanged) {
      callback();
      // 현재의 dependency를 다시 현재 위치에 저장
      effectArray[_index] = dependencies;
    }
    effectIdx++;
  }

  let memoIdx = 0;
  const memoArray = [];

  function useMemo(callback, dependencies) {
    const _index = memoIdx;
    // 현재 위치에 저장되어 있는 값은 기존의 값, 또는 undefined일 것이다
    // 기존의 dependency와, 기존의 callback 결과값
    const [oldDependencies, oldMemoValue] = [memoArray[_index]];

    // 최초 실행 시에는 무조건 callback을 실행하므로 default는 true
    let hasChanged = true;
    // return할 결과 값에 대한 선언
    let memoValue = oldMemoValue;

    // oldDependencies가 존재한다면 현재 받은 dependencies와 비교
    if (oldDependencies) {
      // Array.some 함수를 사용하여 조건을 만족하는 값이 존재하는지 확인
      hasChanged = dependencies.some(
        (dep, i) => !Object.is(dep, oldDependencies[i])
      );
    }

    // 최초 실행, 또는 dependencies 중 변경된 값이 있다면 callback 실행
    if (hasChanged) {
      // callback의 결과 값을 memoValue에 반영
      memoValue = callback();
      // 현재의 dependency를 다시 현재 위치에 저장
      memoArray[_index] = [dependencies, memoValue];
    }

    memoIdx++;

    // 기존의 값, 또는 새로운 callback 결과 값을 return
    return memoValue;
  }

  function render(Component) {
    const C = Component();
    C.render();

    // idx 초기화
    stateIdx = 0;
    effectIdx = 0;
    memoIdx = 0;

    // 해당 값들을 가지고 있는 새로운 Component를 return
    return C;
  }

  return { useState, render, useEffect, useMemo };
})();

function Component() {
  const [count, setCount] = React.useState(1);
  const [text, setText] = React.useState("apple");

  React.useEffect(() => {
    console.log("useEffect: count changed", count);
  }, [count]);

  React.useEffect(() => {
    console.log("useEffect: text changed", text);
  }, [text]);

  const computedValue = React.useMemo(() => {
    return count * 2;
  }, [count]);

  React.useEffect(() => {
    console.log("useEffect: computedValue changed", computedValue);
  }, [computedValue]);

  return {
    render: () => console.log("current state: ", { count, text }),
    click: () => setCount(count + 1),
    plus: () => setCount((c) => c + 1),
    type: (word) => setText(word),
  };
}

const main = () => {
  let App = React.render(Component);
  console.log("=================");
  console.log("event: click App");
  App.click();
  App = React.render(Component);
  console.log("=================");
  console.log("event: type App");
  App.type("pear");
  App = React.render(Component);
  console.log("=================");
  console.log("event: plus App");
  App.plus();
  App = React.render(Component);
};

main();
