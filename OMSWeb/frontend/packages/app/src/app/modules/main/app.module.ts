import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { SharedModule } from '../shared/shared.module'

import { HubService } from '@oms/services/hub.service'
import { AuthService } from '../../services/auth.service'
import { CustomErrorHandler } from '../../handlers/custom-error-handler'
import { CustomHttpInterceptor } from '../../handlers/custom-http.interceptor'
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'
import { StartupComponent } from './startup.component'
import { SettingsModule } from '../settings/settings.module';
import {MonitorStatusComponent} from "@daimre/app/src/app/modules/monitor/status/monitor-status.component";
import {PageUnloadGuard} from "@oms/root/guards/page-unload.guard";
import {KpiModule} from "@daimre/app/src/app/modules/kpi/kpi.module";

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

@NgModule({
  declarations: [AppComponent, StartupComponent, MonitorStatusComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		SharedModule,
		SettingsModule,
		TranslateModule.forRoot({
			useDefaultLang: true,
			defaultLanguage: 'en',
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		KpiModule,
	],
	providers: [
    PageUnloadGuard,
		HubService,
		AuthService,
		{
			provide: ErrorHandler,
			useClass: CustomErrorHandler,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: CustomHttpInterceptor,
			multi: true,
		},
		{
			provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
			useValue: {
				duration: 3000,
				horizontalPosition: 'right',
				verticalPosition: 'bottom',
			},
		},
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: { floatLabel: 'always' },
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
