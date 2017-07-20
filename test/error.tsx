import "jsdom-global/register"
import test from "ava"
import * as React from "react"
import { Observable } from "rxjs"
import { mount } from "enzyme"
import Store, { ImplStore, lift, inject } from "../src"
import { error } from "../src/error"

test.cb("catch error", t => {
	t.plan(4)
	@error(err => t.is(1, err)) // 2
	@inject(Promise.reject(1), "a")
	@lift({}) // 1
	class AppError extends React.Component<any, any>{
		public render() {
			t.pass()
			return <div>{this.props.a}</div>
		}
	}
	const meng = mount(<AppError />)
	Store.children.AppError.setState({ a: 2 }) // 3
	setTimeout(() => {
		t.is(meng.first().text(), "2") // 4
		t.end()
	}, 1000)
})