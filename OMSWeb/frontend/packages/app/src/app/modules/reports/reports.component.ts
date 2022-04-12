import { Component, OnInit } from '@angular/core';
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from '../../../reactApp'
import { ActivatedRoute } from "@angular/router";
import { createBrowserHistory } from "history"
const history = createBrowserHistory();

@Component({
  selector: 'oms-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['reports.component.scss'],
})
export class ReportsComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const node = document.getElementById('react-root')
		const rnode = React.createElement(App, { location: location }, null)
		ReactDOM.render(rnode, node)
  }

}
