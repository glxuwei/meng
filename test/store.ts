import test from "ava"
import { Observable } from "rxjs"
import { mount } from "enzyme"
import { ImplStore } from "../src"

test("should have an empty object", t => {
	const Store = new ImplStore()
	Store.subscribe(state => t.deepEqual(state, {}))
})

test("should keep last initial state", t => {
	t.plan(2)
	const Store = new ImplStore({ a: 0 })
	Store.setState({ a: 1 })
	Store.setState({ a: 2 })
	Store.setState({})
	Store.setState({ a: 3 })
	Store.subscribe(state => {
		t.pass()
		t.deepEqual(state, { a: 3 })
	})
})

test("setState should receive observable, promise and primitive value", t => {
	const Store = new ImplStore<{ a: number }>()
	const api = new Promise<number>((v, r) => v(2))
	const api$ = Observable.of(3)
	Store.setState({ a: 1 })
	Store.setState(api.then(value => ({ a: value })))
	Store.setState(api$.map(value => ({ a: value })))
	Store.subscribe(state => {
		t.pass()
		t.deepEqual(state, { a: 3 })
	})
})

test("subscribed store should merge new state", t => {
	type TStore = {
		a: number
		b?: number
		c?: number[]
	}
	const Store = new ImplStore<TStore>({ a: 0 })
	let num = 0
	Store.subscribe(state => {
		if (++num === 4) t.deepEqual(state, { a: 1, b: 2, c: [1, 2] })
	})
	Store.setState({ a: 1 })
	Store.setState({ b: 2 })
	Store.setState({ c: [1, 2] })
})

test("subscribed store should not update if state is shallow equal with previous state", t => {
	t.plan(3)
	const Store = new ImplStore({ a: 1, b: { c: 2 } })
	Store.subscribe(state => {
		t.pass()
	})
	// should not update store's state, because a: 1 is equal with a: 1
	Store.setState({ a: 1 })
	Store.setState({ a: 2 })
	// should update, because store just shallow equal state
	Store.setState({ b: { c: 2 } })
})


test("setState callback should work", t => {
	t.plan(1)
	const Store = new ImplStore<{ a: number }>({ a: 1 })
	Store.setState({ a: 2 }, () => {
		t.pass()
	})

	Store.subscribe((state) => {
		if (state._callback) state._callback()
	})
})

test.cb("callback of setState will catch the error message", t => {
	t.plan(3)
	const store = new ImplStore({ a: 1 })
	const api = new Promise((v, r) => {
		JSON.parse("")
		v(1)
	})

	store.subscribe((data) => t.pass(), err => t.pass())

	store.setState(api, error => {
		t.truthy(error)
		t.true(error instanceof Error)
	})

	setTimeout(t.end, 2000)
})

test("shallow equal should exclude _callback", t => {
	t.plan(2)
	const Store = new ImplStore<{ a: number }>({ a: 1 })
	Store.setState({ a: 2 }, () => {
		t.pass()
	})

	Store.subscribe(() => { t.pass() })
	Store.setState({ a: 2 }, () => t.pass())
	Store.setState({ a: 2 })
})
