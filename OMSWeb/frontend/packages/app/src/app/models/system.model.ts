import {
	HostModeEnums,
	HostSessionStatusEnums,
	TscModeEnums,
} from '@oms/models/enums'
import DevExpress from "devextreme";
import RemoteFileSystemProvider = DevExpress.fileManagement.RemoteFileSystemProvider;

export interface ISystemStates {
	sessionStatus?: HostSessionStatusEnums
	hostMode?: HostModeEnums
	tscMode?: TscModeEnums
	aiMode?: boolean
}

export interface ISettingMode {
    homeMode?: boolean
    ivrMode?: boolean
    chainManualCommandDisabled?: boolean
}

export interface IServiceProcessStates {
	name: string
	version: string
	isRunning: boolean
}

export interface IModuleStatus {
	id: number
	name: string
	version: string
	releaseTime: Date
	pid: number
	startTime: Date
}

export interface IFileItem extends RemoteFileSystemProvider{
	name: string
	isDirectory: boolean
	dateModified: Date
	size?: number
	items?: IFileItem[]
}
