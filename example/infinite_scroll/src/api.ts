function* dataGenerator() {
  let index = 0
  while (true) {
    const arr: number[] = []
    for (let i = 100; i--;) {
      arr.push(index++)
    }
    yield arr
  }
}

const gen = dataGenerator()

export const fetchData = (currentState: any, nextState: any): Promise<[number]> => new Promise((resolve, reject) => {
  console.log("this is a request")
  resolve(currentState.lis.concat(gen.next().value))
})