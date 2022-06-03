import {
	Component,
	OnInit,
	OnChanges,
	OnDestroy,
	AfterViewInit,
} from '@angular/core'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from '../../../reactApp'
import * as uuid from 'uuid'
import { ActivatedRoute } from '@angular/router'
import { createBrowserHistory } from 'history'
const history = createBrowserHistory()

@Component({
	selector: 'oms-reports',
	templateUrl: './reports.component.html',
	styleUrls: ['reports.component.scss'],
})
export class ReportsComponent
	implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
	private rootDomID: string

	constructor(private route: ActivatedRoute) {}
	protected getRootDomNode() {
		const node = document.getElementById('react-root')
		return node
	}

	private isMounted(): boolean {
		return !!this.rootDomID
	}

	protected render() {
		if (this.isMounted()) {
			const rnode = React.createElement(App, { location: location }, null)
			ReactDOM.render(rnode, this.getRootDomNode())
		}
	}
	ngOnInit() {
		this.rootDomID = uuid.v1()
	}
	ngOnChanges() {
		this.render()
	}
	ngAfterViewInit() {
		this.render()
	}
	ngOnDestroy() {
		ReactDOM.unmountComponentAtNode(this.getRootDomNode())
	}
}
