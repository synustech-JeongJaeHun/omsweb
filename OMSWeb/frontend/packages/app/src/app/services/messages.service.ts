import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import {
	ICommandMessage,
	ITrackCommandMessage,
	IOrderCommandMessage,
	IVehicleCommandMessage,
	IAllCommandMessage,
	IAiModeCommandMessage,
	ITscStateCommandMessage,
    IMapUpdateCommandMessage,
    IOnlineStateCommandMessage,
	IControlStateCommandMessage,
	IAlarmClearCommandMessage,
	IWarningClearCommandMessage,
	IStationCommandMessage,
	IBufferCommandMessage,
	ICarrierCommandMessage,
	IAllSegmentCommandMessage,
	IVehicleRegCommandMessage,
	ISegmentCommandMessage,
	IClusterCommandMessage,
	IGroupCommandMessage,
	ISettingZcuCommandMessage,
	IZcuCommandMessage,
	IDisableHomeCommandMessage,
	IEnableHomeCommandMessage,
    IToggleHomeModeCommandMessage,
    IChangeHomeModeCommandMessage,
    IChangeIvrModeCommandMessage,
    IToggleChainManualCommandDisabledCommandMessage,
    IResetVehicleMileageTotalCommandMessage,
} from '../models/command.model'
import { IOrderStatusRow } from '../models/order-status.model'
import { IVehicleStatusRow } from '../models/vehicle-status.model'
import { IZcuStatusRow } from '../models/zcu-status.model'

@Injectable({
	providedIn: 'root',
})
export class MessagesService {
	private baseUrl = '/api/messages'
	constructor(private http: HttpClient) {}

	sendDeleteOrder(order: IOrderStatusRow): Observable<void> {
		const {
			vehicleId,
			id: orderId,
			locationPickup,
			locationDropoff,
			locationMove,
			priority,
			carrierLabel,
		} = order
		return this.sendOrderCommand({
			type: 'ORDER',
			action: 'A',
			orderId,
			vehicleId,
			orderOrigin: 'OMS',
			locationPickup,
			locationDropoff,
			locationMove,
			priority,
			carrierLabel,
		})
    }

    sendUpdateOrder(order: IOrderStatusRow, newDestName: string): Observable<void> {
      const {
        vehicleId,
        id: orderId,
        logicalId,
        locationPickup,
        locationDropoff,
        locationMove,
        priority,
        carrierLabel,
      } = order
      return this.sendOrderCommand({
        type: 'ORDER',
        action: 'M',
        orderId,
        commandID: logicalId,
        vehicleId,
        orderOrigin: 'OMS',
        locationPickup,
        locationDropoff: newDestName,
        locationMove,
        priority,
        carrierLabel,
      })
    }

    sendOnlineStateCommand(
      command: IControlStateCommandMessage,
    ): Observable<void> {
      return this.sendCommand<IOnlineStateCommandMessage>(command)
    }

	sendControlStateCommand(
		command: IControlStateCommandMessage,
	): Observable<void> {
		return this.sendCommand<IControlStateCommandMessage>(command)
	}

	sendTscStateCommand(command: ITscStateCommandMessage): Observable<void> {
		return this.sendCommand<ITscStateCommandMessage>(command)
	}

	sendAIModeCommand(command: IAiModeCommandMessage): Observable<void> {
		return this.sendCommand<IAiModeCommandMessage>(command)
	}

	sendAlarmClearCommand(
		command: IAlarmClearCommandMessage,
		targets: number[] = [],
		error_code: number,
	): Observable<void> {
		command.vehicleIds = targets
		command.alarmCode = error_code
		return this.sendCommand<IAlarmClearCommandMessage>(command)
	}

	sendWarningClearCommand(
		command: IWarningClearCommandMessage,
		targets: number[] = [],
		ackBy: string,
	): Observable<void> {
		command.WarningIds = targets
		command.WarningAckBy = ackBy
		return this.sendCommand<IWarningClearCommandMessage>(command)
	}

	sendWarningAllClearCommand(
		command: IWarningClearCommandMessage,
		ackBy: string,
	): Observable<void> {
		command.WarningIds = [-1]
		command.WarningAckBy = ackBy
		return this.sendCommand<IWarningClearCommandMessage>(command)
	}

	sendServerModuleControlCommand(
		command: IControlStateCommandMessage,
	): Observable<void> {
		command.type = 'MODULE'
		return this.sendCommand<IControlStateCommandMessage>(command)
	}

	sendMapUpdateCommand(command: IMapUpdateCommandMessage): Observable<void> {
		command.type = 'MAPUPDATE'
		return this.sendCommand<IMapUpdateCommandMessage>(command)
	}

	sendVehicleAllCommand(command: IAllCommandMessage): Observable<void> {
		command.type = 'VEHICLE_ALL'
		return this.sendCommand<IAllCommandMessage>(command)
	}

	sendVehicleCommand(
		command: IVehicleCommandMessage,
		targets: IVehicleStatusRow[] = [],
	): Observable<void> {
		command.type = 'VEHICLE'
		command.vehicleIds = targets.map((x) => x.id)
		return this.sendCommand<IVehicleCommandMessage>(command)
	}

	sendVehicleDirectCommand(
		command: IVehicleCommandMessage,
		targets: number[] = [],
	): Observable<void> {
		command.type = 'VEHICLE'
		command.vehicleIds = targets
		return this.sendCommand<IVehicleCommandMessage>(command)
	}

	sendOrderCommand(command: IOrderCommandMessage): Observable<void> {
		return this.sendCommand<IOrderCommandMessage>(command)
	}

	sendDisableSegmentCommand(
		command: ITrackCommandMessage,
		targets: number,
	): Observable<void> {
		command.type = command.type
		command.segmentId = targets
		command.source = 'uid-admin'

		return this.sendCommand<ITrackCommandMessage>(command)
	}

  sendEnableSegmentCommand(
    command: ITrackCommandMessage,
    targets: number,
  ): Observable<void> {
    command.type = command.type
    command.segmentId = targets
    command.source = 'v-master'

    return this.sendCommand<ITrackCommandMessage>(command)
  }

	sendDisableSegmentsCommand(
		command: ITrackCommandMessage,
		targets: number[] = [],
	): Observable<void> {
		command.type = command.type
		command.segmentIds = targets
		command.source = 'uid-admin'

		return this.sendCommand<ITrackCommandMessage>(command)
	}

	sendStationSettingCommand(
		command: IStationCommandMessage,
		targets: number[] = [],
	): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.unused = command.unused
		command.stationIds = targets

		return this.sendCommand<IStationCommandMessage>(command)
	}

	sendBufferSettingCommand(
		command: IBufferCommandMessage,
		targets: number[] = [],
	): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.unused = command.unused
		command.bufferIds = targets

		return this.sendCommand<IBufferCommandMessage>(command)
	}

	sendCarrierCommand(command: ICarrierCommandMessage): Observable<void> {
		command.type = 'CARRIER'
		command.action = command.action

		return this.sendCommand<ICarrierCommandMessage>(command)
	}

	sendAllSpeedRatioSegmentCommand(
		command: IAllSegmentCommandMessage,
		targets: number,
	): Observable<void> {
		command.type = 'SEGMENT-ALL'
		command.speedRatio = targets

		return this.sendCommand<IAllSegmentCommandMessage>(command)
	}

	sendSegmentSettingCommand(command: ISegmentCommandMessage): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.segmentId = command.segmentId
		command.speedRatio = command.speedRatio
		command.segmentIds = command.segmentIds
		command.speedRatios = command.speedRatios

		return this.sendCommand<ISegmentCommandMessage>(command)
	}

	sendSettingZcuCommand(command: ISettingZcuCommandMessage): Observable<void> {
		return this.sendCommand<ISettingZcuCommandMessage>(command)
	}

	sendZcuCommand(command: IZcuCommandMessage): Observable<void> {
		command.type = 'ZCU'

		return this.sendCommand<IZcuCommandMessage>(command)
	}

	sendVehicleRegSettingCommand(
		command: IVehicleRegCommandMessage,
	): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.vehicleIds = command.vehicleIds
		command.logicalIds = command.logicalIds

		return this.sendCommand<IVehicleRegCommandMessage>(command)
	}

	sendMaxVehiclesClusterCommand(
		command: IClusterCommandMessage,
	): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.clusterId = command.clusterId
		command.maxVehicles = command.maxVehicles

		return this.sendCommand<IClusterCommandMessage>(command)
	}

	sendAssignVehicleGruopCommand(
		command: IGroupCommandMessage,
	): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.vehicleId = command.vehicleId
		command.vehicleIds = command.vehicleIds

		return this.sendCommand<IGroupCommandMessage>(command)
	}

	sendAssignHomeGruopCommand(command: IGroupCommandMessage): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.homeId = command.homeId
		command.homeIds = command.homeIds

		return this.sendCommand<IGroupCommandMessage>(command)
	}

	sendAssignStationGruopCommand(
		command: IGroupCommandMessage,
	): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.stationId = command.stationId
		command.stationIds = command.stationIds

		return this.sendCommand<IGroupCommandMessage>(command)
	}

	sendAssignBufferGruopCommand(
		command: IGroupCommandMessage,
	): Observable<void> {
		command.type = command.type
		command.action = command.action
		command.bufferId = command.bufferId
		command.bufferIds = command.bufferIds

		return this.sendCommand<IGroupCommandMessage>(command)
	}

	sendEnableHome(pointId: number, groupIds: number[]) {
		return this.sendCommand<IEnableHomeCommandMessage>({
			action: 'enable-home',
			pointId: pointId,
			groupIds: groupIds,
		})
	}

	sendDisableHome(pointId: number) {
		return this.sendCommand<IDisableHomeCommandMessage>({
			action: 'disable-home',
			pointId: pointId,
		})
	}

	sendHomeModeToggle() {
		return this.sendCommand<IToggleHomeModeCommandMessage>({
			action: 'home_mode',
			mode: 'change',
		})
    }

    sendHomeModeChange(enabled: string) {
        return this.sendCommand<IChangeHomeModeCommandMessage>({
            action: 'home_mode',
            mode: enabled,
        })
    }

    sendIvrModeChange(enabled: string) {
        return this.sendCommand<IChangeIvrModeCommandMessage>({
            action: 'ivr_mode',
            mode: enabled,
        })
    }

	sendChainManualCommandDisabled() {
		return this.sendCommand<IToggleChainManualCommandDisabledCommandMessage>({
			action: 'chain_manual_command_disabled',
			mode: 'change',
		})
    }

    sendResetVehicleMileageTotal(type: string, vids: number[]) {
        return this.sendCommand<IResetVehicleMileageTotalCommandMessage>({
            action: 'reset_vehicle_mileage_total',
            vehicleIds: vids,
            mode: type,
        })
    }

	private sendCommand<T extends ICommandMessage>(command: T): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}/command`, command)
	}
}
