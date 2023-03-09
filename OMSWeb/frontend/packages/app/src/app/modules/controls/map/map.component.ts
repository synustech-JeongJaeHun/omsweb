import {Component, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import {TrackIdService} from "../../../services/track-id.service";
import {ClientPreferences} from "../../../models/settings.model";
import {HistoriesService} from "../../../services/histories.service";
import {DateUtil} from "../../shared/utils/date.util";
import {SettingsService} from "../../../services/settings.service";
import {AuthService} from "../../../services/auth.service";
import {MessagesService} from "../../../services/messages.service";
import {NotificationsService} from "../../../services/notifications.service";
import {TranslateService} from "@ngx-translate/core";
import {IAnnotation} from "../../../models/annotation.model";
import {SystemsService} from "../../../services/systems.service";

@Component({
  selector: 'oms-map',
  templateUrl: './map.component.html',
  styles: [
    `
			#history-page {
				background-color: var(--panel-background-color);
				display: grid;
				grid-template-rows: 40px auto;
				left: 0;
				right: 0;
				bottom: 0;
				top: 44px;
				gap: 4px;
				height: 100%;
			}

			#filter-area {
				padding: 4px 10px;
				display: grid;
				grid-template-columns: 210px 10px 210px 170px;
				justify-items: flex-start;
				align-items: center;
				gap: 4px;
			}

			#search-area {
				display: flex;
				align-items: center;
				gap: 10px;
			}

			#search-area label {
				margin-left: 10px;
				font-size: 12px;
			}

			#filter-area button {
				justify-self: normal;
				align-self: normal;
			}

			#grid-container {
				padding: 0 10px;
			}

			#filter-area .dx-datebox {
			}
		`,
  ],
})
export class MapComponent implements OnInit {

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent
  dataSource: DataSource

  dateTimeFormat = DateUtil.DateTimeFormat
  constructor(
    private t$: TranslateService,
    private systemSvc: SystemsService
  ) {
  }

  ngOnInit() {
    this.dataSource = this.systemSvc.dbHistory();
  }
}
