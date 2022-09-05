import { readonly, ref } from 'vue'
import { VehicleSecondaryContent } from './types/VehicleSecondaryContent'

const vehicleSecondaryContent = ref<VehicleSecondaryContent>('order')
const readonlyVehicleSecondaryContent = readonly(vehicleSecondaryContent)

function updateVehicleSecondaryContent(content: VehicleSecondaryContent) {
  vehicleSecondaryContent.value = content
}

export { readonlyVehicleSecondaryContent, updateVehicleSecondaryContent }
